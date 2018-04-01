# My first Smart Contract in Solidity

> Based on https://www.ethereum.org/greeter

## Deploy Manual

```
npm install web3@0.20.0 solc
```

```
mkdir contracts && touch contracts/greeter.sol
```

```solidity
// contracts/GreetingsFactory.sol
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
```

Install and open [Ganache](http://truffleframework.com/ganache/)

in a node console:

```node
> Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545')) // connect to the Ganache node
> solc = require('solc')
> sourceCode = fs.readFileSync('./contracts/GreetingsFactory.sol').toString() // get string of from the contract
> compiledCode = solc.compile(sourceCode); // compile it
> contractABI = JSON.parse(compiledCode.contracts[':GreetingsFactory'].interface); // interface of the contract
> byteCode = compiledCode.contracts[':GreetingsFactory'].bytecode // store byteCode
> greetingsContract = web3.eth.contract(contractABI); // get contract Factory from web3
> greetingsDelpoyed = greetingsContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000}); // deploy contract on the ganache node
> greetingsInstance = greetingsContract.at(greetingsDelpoyed.address); // get instance
> greetingsInstance.getGreetings();
['Hey there!', '0x627306090abaB3A6e1400e9345bC60c78a8BEf57']
> greetingsInstance.setGreetings('Hello world', { from: web3.eth.accounts[1] });
> greetingsInstance.getGreetings();
['Hello world', '0xf17f52151EbEF6C7334FAD080c5704D77216b732']
```

## User Truffle as SmartContract Management

install truffle globally
```zsh
npm install -g truffle
```

Init a truffle project with the webpack box

> This will delete this README file so please save it before

```zsh
truffle unbox webpack
```

Remove all the contract in the `contracts/` folder except the `Migration.sol` and the GreeingsFactory.sol that we've just created and change the second migration in the `migrations/` folder as follow:

```javascript
// migrations/2_deploy_contracts.js
var GreetingsFactory = artifacts.require("./GreetingsFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(GreetingsFactory);
};
```

Change the html, the css and the javascript in the `app/` folder.

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
      <!-- hard coded example to remove when javascript is done -->
      <p id="account">0x627306090abaB3A6e1400e9345bC60c78a8BEf57</p>
      <p id="accountBalance">10 ETH</p>
    </div>
    <h1>Greetings</h1>
    <div>
      <!-- hard coded example to remove when javascript is done -->
      <span class="speech-bubble" id="greeting">
        Hello World
      </span>
    </div>
    <p class="greeter-head">🙋‍</p>
    <!-- hard coded example to remove when javascript is done -->
    <p id="greeter">0x627306090abaB3A6e1400e9345bC60c78a8BEf57</p>
  </body>
</html>
```

```css
/* app/stylesheets/app.css */
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
// app/javascripts/app.css

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import Web3 from 'web3';
import TruffleContract from 'truffle-contract'

// Import our contract artifacts (ABI) and turn them into usable abstractions.
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
      // fallback - use your fallback strategy (for us it's Ganache)
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545")
    }
    window.web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();
    App.initContract();
  },
  displayAccountInfo: function() {
    const account = document.getElementById('account');
    const accountBalance = document.getElementById('accountBalance');
    // get the account of reference, by default the first one
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
      // get greeting and put it on the HTML
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

Run the migration. (be sure ganache is running!)

```zsh
truffle migrate --compile-all --reset --network development
```

Run the app. You should see 'Hey there!' on [http://localhost:8080](http://localhost:8080)

> If you have the MetaMask extension, don't forget to disable it before!

```zsh
npm run dev
```

Run the truffle console on a new terminal window.

```
truffle console --network development
```

And set a new greeting from it
```node
> GreetingsFactory.deployed().then((instance) => { greetingsInstance = instance }) // get the instance with the truffle way
> greetingsInstance.getGreetings();
['Hey there!', '0x627306090abaB3A6e1400e9345bC60c78a8BEf57']
> greetingsInstance.setGreetings('Hello world', { from: web3.eth.accounts[1] });
> greetingsInstance.getGreetings();
['Hello world', '0xf17f52151EbEF6C7334FAD080c5704D77216b732']
```

Got back to [http://localhost:8080](http://localhost:8080), You should see 'Hello world'. Congrats you've just finished your first DAPP. 🚀

> The solution is on the branch `solution` of this repo.
