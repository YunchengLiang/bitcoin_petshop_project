pragma solidity ^0.5.0;

contract Adoption {
	address[16] public adopters;

	event AdoptedAnimal(uint petId);

	// Adopting a pet
	function adopt(uint petId) public returns (uint) {
  		require(petId >= 0 && petId <= 15);

  		adopters[petId] = msg.sender;

		emit AdoptedAnimal(petId);

 		return petId;
	}

	// Retrieving the adopters
	function getAdopters() public view returns (address[16] memory) {
 	 	return adopters;
	}

 	function sendPet(uint petId, address newOwner) public {
        	require(newOwner != address(0));
        	require(adopters[petId] == msg.sender);

        	adopters[petId] = newOwner;
    	}




    	event ReturnedAnimal(uint petId);

    	function returnAnimal(uint petId) public returns (uint) {
        	require(petId >= 0 && petId <= 15);

        	// If the animal has been adopted by msg.sender, the animal can be returned
        	if (adopters[petId] == msg.sender) {
            		// "Return" an animal by setting the address of it's adopter back to 0
            		adopters[petId] = address(0);
        	}

        	emit ReturnedAnimal(petId);

        	return petId;
    	}

	// Model a Candidate for voting
	struct Candidate {
		uint id;
		string name;
		uint voteCount;
	}
	mapping(address => bool) public voters;
	mapping(uint => Candidate) public candidates;
	uint public candidatesCount;

	event votedEvent (
		uint indexed _candidateId
	);

	constructor () public {
		addCandidate("Frieda");
		addCandidate("Gina");
		addCandidate("Collins");
		addCandidate("Melissa");
		addCandidate("Jeanine");
		addCandidate("Elvia");
		addCandidate("Latisha");
		addCandidate("Coleman");
		addCandidate("Nichole");
		addCandidate("Fran");
		addCandidate("Leonor");
		addCandidate("Dean");
		addCandidate("Stevenson");
		addCandidate("Kristina");
		addCandidate("Ethel");
		addCandidate("Terry");
	}

	function addCandidate(string memory _name) private {
		candidatesCount ++;
		candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
	}

	function vote(uint _candidateId) public {
                //can not vote more than once
		require(!voters[msg.sender]);
		require(_candidateId > 0 && _candidateId <= candidatesCount);
		// record vote status
		voters[msg.sender] = true;
		// update the vote Count
		candidates[_candidateId].voteCount ++;

		emit votedEvent(_candidateId);
	}


}