pragma solidity ^0.4.17;

contract GreetingsFactory {
    string greeting;
    address greeter;

    function GreetingsFactory() public {
        setGreetings('Hey there!');
    }

    function getGreetings() public view returns (string _greeting, address _greeter) {
        return(greeting, greeter);
    }

    function setGreetings(string _greeting) public {
        greeter = msg.sender;
        greeting = _greeting;
    }
}
