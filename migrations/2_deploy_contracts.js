var GreetingsFactory = artifacts.require("./GreetingsFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(GreetingsFactory);
};
