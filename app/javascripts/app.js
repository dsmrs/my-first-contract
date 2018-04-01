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
      App.initContract();
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
