import Web3 from "web3";
import votingArtifact from "../../build/contracts/Voting.json";


let candidates = {}
let pricePerToken;

const App = {
 web3: null,
 account: null,
 voting: null,
 contractAddress: null,

 start: async function() {
  const { web3 } = this;

  try {
   // get contract instance
   console.log(web3.eth)
   console.log(web3.eth.net.getId)
   const networkId = await web3.eth.net.getId();
   console.log(networkId)
   const deployedNetwork = votingArtifact.networks[networkId];
   this.contractAddress = deployedNetwork.address;
   this.voting = await new web3.eth.Contract(
    votingArtifact.abi,
    deployedNetwork.address,
   );

   // get accounts
   const accounts = await web3.eth.getAccounts();
   this.account = accounts[0];
   this.populateCandidates();
  } catch (error) {
   console.log(error);
   console.error("Could not connect to contract or chain.");
  }
 },
 populateCandidates: async function() {
     await this.loadCandidates();
     this.setupCandidateRows();
     await this.populateTokenData();

     const { totalVotesFor } = this.voting.methods;
     let candidateNames = Object.keys(candidates);
     console.log(candidateNames)  
     for(var i = 0; i < candidateNames.length; i++) {
         let name = candidateNames[i];
         var count = await totalVotesFor(this.web3.utils.asciiToHex(name)).call();
         console.log(count)
         $("#" + candidates[name]).html(count);
     }
 },
 loadCandidates: async function() {
     const { allCandidates } = this.voting.methods;
     let candidateArray = await allCandidates().call();
     for(let i=0; i < candidateArray.length; i++){
         // Since the candidate names are stores as bytes32 on the blockchain we use toUtf8 method to convert from bytes32 to string //
         candidates[this.web3.utils.hexToUtf8(candidateArray[i])] = "candidate-" + i;
     }
 },
 setupCandidateRows: function() {
     Object.keys(candidates).forEach(function (candidate){
         $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id ='" + candidate[candidate] + "'></td></tr>");
     });
 },
 populateTokenData: async function() {
    const { web3 } = this;
    const { totalTokens, tokensSold, tokenPrice } = this.voting.methods;
  
    let value = await totalTokens().call();
    $("#tokens-total").html(value.toString());
  
    value = await tokensSold().call();
    $("#tokens-sold").html(value.toString());
  
    value = await tokenPrice().call();
    pricePerToken = web3.utils.fromWei(value.toString());
    $("#token-cost").html(pricePerToken + " Ether");
  
    web3.eth.getBalance(this.contractAddress, function(error, result) {
     $("#contract-balance").html(web3.utils.fromWei(result.toString()) + " Ether");
    });
   },
   buyTokens: async function() {
       let tokensToBuy = parseInt($("#buy").val());
       let price = tokensToBuy * parseInt(this.web3.utils.toWei(pricePerToken));
       const { buy } = this.voting.methods;
       $("#buy-msg").html("Purchase Order has been submitted. Please wait for your tokens");
       await buy().send({gas: 140000, value: price, from: this.account})
       $("#buy-msg").html("");
       let balance = await this.web3.eth.getBalance(this.contractAddress)
       $("#contract-balance").html(this.web3.utils.fromWei(balance.toString())+ " Ether")
        await this.populateTokenData();
   },
   voteForCandidate: async function() {
       const { web3 } = this;
       let candidateName = $("#candidate").val();
       let voteTokens = $("#vote-tokens").val();
       $("#msg").html("Vote has been submitted. The vote count will change as soon as it is recorded onto the blockchain. Please wait.")
       $("#candidate").val("");
       $("#vote-tokens").val("");
       const { totalVotesFor, voteForCandidate } = this.voting.methods;
       await voteForCandidate(web3.utils.asciiToHex(candidateName),voteTokens).send({gas: 140000,from: this.account});
       console.log(candidates);
       console.log(candidateName);
       let div_id = candidates[candidateName];
       console.log(div_id);
       var count = await totalVotesFor(web3.utils.asciiToHex(candidateName)).call();
       $("#" + div_id).html(count);
       $("#msg").html("");
   },
   lookupVoterInfo: async function(){
       let address = $("#voter-info").val();
        const { voterDetails } = this.voting.methods;
        var voter = await voterDetails(address).call();
        console.log(voter)
        debugger
        console.log(voter[1])
        $("#").html(voter.methods._bigNumber)
        for(var i = 0; i<voter.length;i++){
            let voterInfo = voter[i]
            $("#test").html(voterInfo);
        };
   }
};

window.App = App;

window.addEventListener("load", function() {
 if (window.ethereum) {
  // use MetaMask's provider
  App.web3 = new Web3(window.ethereum);
  window.ethereum.enable(); // get permission to access accounts
 } else {
  console.warn(
   "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",
  );
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  App.web3 = new Web3(
   new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
  );
 }

 App.start();
});