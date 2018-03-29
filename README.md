# My first Smart Contract in Solidity

> Based on https://www.ethereum.org/greeter

## Deploy Manual

```
npm install web.js@0.20.0 solc
```

```
mkdir contracts && touch contracts/greeter.sol
```

```solidity
// contracts/greeter.sol
pragma solidity ^0.4.17;

contract GreetingsFactory {
    string greeting;
    address greeter

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
```

Install and open [Ganache](http://truffleframework.com/ganache/)

in a node console:

```bash
> Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
> solc = require('solc')
> sourceCode = fs.readFileSync('./contracts/greeter.sol').toString()
> compiledCode = solc.compile(sourceCode);
> contractABI = JSON.parse(compiledCode.contracts[':Greeter'].interface);
> byteCode = compiledCode.contracts[':Greetings'].bytecode
> greetingsContract = web3.eth.contract(contractABI); # Factory
> greetingsDelpoyed = greetingsContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000}); # create contract on the blockchain
> greetingsInstance = greetingsContract.at(greetingsDelpoyed.address);
```

## User Truffle as SmartContract Management

install truffle globally
```
npm install -g truffle
```

Init a truffle project with the webpack box
```
truffle unbox webpack
```

Change the html, the css and the javascript in the `app/` folder, remove all the contract in the `contracts/` folder except the `Migration.sol` and remove the second migration in the `migrations/` folder.

```HTML
<!-- app/index.html -->

<!DOCTYPE html>
<html>
  <head>
    <title>Greetings - My First Smart Contract</title>
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
    <script src="./app.js"></script>
  </head>
  <body>
    <div class="account-info">
      <h3>Your account</h3>
      <p id="account">0x627306090abaB3A6e1400e9345bC60c78a8BEf57</p>
      <p id="accountBalance">10 ETH</p>
    </div>
    <h1>Greetings</h1>
    <div>
      <span class="speech-bubble" id="greeting">
        Hello World
      </span>
    </div>
    <p class="greeter-head">🙋‍</p>
    <p id="greeter">0x627306090abaB3A6e1400e9345bC60c78a8BEf57</p>
  </body>
</html>
```

```css
body {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  height: 100vh;
  text-align: center;
  font-family: "Open Sans", sans-serif;
  color: #0f4137;
  background-color: #e7f5f2;
}
h1 {
  margin: 70px;
}
.speech-bubble {
  color: #f9c7cf;
  padding: 25px 20px;
  position: relative;
  background: #12776f;
  border-radius: .4em;
  margin-bottom: 20px;
  max-width: 300px;
}
.speech-bubble:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 0;
	border: 13px solid transparent;
  border-top-color: #12776f;
  border-bottom: 0;
  border-left: 0;
  margin-left: -6.5px;
  margin-bottom: -13px;
}
.greeter-head {
  font-size: 80px;
  margin-top: 50px;
  margin-bottom: 10px;
}
```

```javascript
// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import Web3 from 'web3';
import TruffleContract from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import greetings_artifacts from '../../build/contracts/GreetingsFactory.json'


const App = {
  contracts: {},
  web3Provider: null,
  account: 0x0,
  init: function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545")
    }
    window.web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();
    App.initContract();
  },
  displayAccountInfo: function() {
    const account = document.getElementById('account');
    const accountBalance = document.getElementById('accountBalance');
    web3.eth.getCoinbase((err, coinbase) => {
      App.account = coinbase;
      account.innerText = App.account;
      web3.eth.getBalance(App.account, (err, balance) => {
        accountBalance.innerText = `${web3.fromWei(balance, 'ether').toNumber()} ETH`;
      })
    })
  },
  initContract: function() {
    // GreeingsFactory is our usable abstraction, which we'll use through the code below.
    App.contracts.GreeingsFactory = TruffleContract(greetings_artifacts);
    App.contracts.GreeingsFactory.setProvider(App.web3Provider);
    // get greetings from the contract
    App.reloadGreetings();
  },
  reloadGreetings: function() {
    App.contracts.GreeingsFactory.deployed()
    .then((instance) => instance.getGreetings())
    .then(([greeting, greeter]) => {
      const greetingEl = document.getElementById('greeting');
      const greeterEl = document.getElementById('greeter');
      greetingEl.innerText = greeting
      if (greeter === App.account) {
        greeterEl.innerText = 'You';
      } else {
        greeterEl.innerText = greeter;
      }
    })
  }
};

window.addEventListener('load', function() {
  App.init();
});
```
