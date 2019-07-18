pragma solidity >=0.4.0 <0.6.0;

contract Voting {
// Contract Specification // 
 //1. Users should be able to purchase tokens 
  //2. Users should be able to vote for candidates with tokens
  //3. Anyone should be able to lookup voter info
 // We use the struct datatype to store the voter information.
 struct voter {
  address voterAddress; // The address of the voter
  
  uint tokensBought;  // The total no. of tokens this voter owns
  
  uint[] tokensUsedPerCandidate; // Array to keep track of votes per candidate.
  /* We have an array of candidates initialized below.
   Every time this voter votes with her tokens, the value at that
   index is incremented. Example, if candidateList array declared
   below has ["Rama", "Nick", "Jose"] and this
   voter votes 10 tokens to Nick, the tokensUsedPerCandidate[1]
   will be incremented by 10.
   */
 }

 /* mapping is equivalent to an associate array or hash
  The key of the mapping is candidate name stored as type bytes32 and value is
  an unsigned integer which used to store the vote count
  */

 mapping (address => voter) public voterInfo;

 /* Solidity doesn't let you return an array of strings yet. We will use an array of bytes32
  instead to store the list of candidates
  */

 mapping (bytes32 => uint) public votesReceived;

 bytes32[] public candidateList;

 uint public totalTokens; // Total no. of tokens available for this election
 uint public balanceTokens; // Total no. of tokens still available for purchase
 uint public tokenPrice; // Price per token

 /* When the contract is deployed on the blockchain, we will initialize
  the total number of tokens for sale, cost per token and all the candidates
  */
 constructor(uint _tokens, uint _pricePerToken, bytes32[] memory _candidateNames) public {
  candidateList = _candidateNames;
  totalTokens = _tokens;
  balanceTokens = _tokens;
  tokenPrice = _pricePerToken;
 }
 function totalVotesFor(bytes32 candidate) public view returns (uint) {
    return votesReceived[candidate];
 }
 function buy() public payable {
     uint tokensToBuy = msg.value / tokenPrice;
     require(tokensToBuy <= balanceTokens);
     voterInfo[msg.sender].voterAddress = msg.sender;
     voterInfo[msg.sender].tokensBought += tokensToBuy;
    balanceTokens -= tokensToBuy;
 }

 function voteForCandidate(bytes32 candidate, uint tokens) public {
    // Check to make sure user has enough tokens to vote
    // Increment vote count for candidate
    // Update the voter struct tokensUsedPerCandidate for this voter
    uint availableTokens = voterInfo[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);
    require(tokens <= availableTokens);
    votesReceived[candidate] += tokens;

    if(voterInfo[msg.sender].tokensUsedPerCandidate.length == 0){
        for(uint i=0; i<candidateList.length; i++){
            voterInfo[msg.sender].tokensUsedPerCandidate.push(0);
        }
    }
    uint index = indexOfCandidate(candidate);
    voterInfo[msg.sender].tokensUsedPerCandidate[index] += tokens;
    
 }
 function indexOfCandidate(bytes32 candidate) view public returns(uint){
     for(uint i=0; i<candidateList.length; i++){
         if (candidateList[i] == candidate){
             return i;
         }
     }
 }
 function totalTokensUsed(uint[] memory _tokenUsedPerCandidate ) private pure returns (uint){
     uint totalUsedTokens = 0;
     for(uint i=0; i<_tokenUsedPerCandidate.length; i++){
         totalUsedTokens +=_tokenUsedPerCandidate[i];
     }
     return totalUsedTokens;
 }  
 function voterDetails(address user) view public returns (uint, uint[] memory){
     return (voterInfo[user].tokensBought, voterInfo[user].tokensUsedPerCandidate);
 }
 function tokensSold() public view returns (uint) {
     return totalTokens - balanceTokens;
 }
 function allCandidates() public view returns (bytes32[] memory){
     return candidateList;
 }
 
}