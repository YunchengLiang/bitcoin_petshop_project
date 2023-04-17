pragma solidity >=0.5.0;

contract SendMeEther {
    
    string public functionCalled;
    
    //constructor of the contract SendMeEther
    constructor() public {
	functionCalled = "constructor";
    }

    //function allowing an ether payment to the contract address
    function receiveEther() external payable {
	functionCalled = "receiveEther";
    }

    //fallback function allowing an ether payment to the contract address 
    function() external payable {
	functionCalled = "fallback";
    }


} 
