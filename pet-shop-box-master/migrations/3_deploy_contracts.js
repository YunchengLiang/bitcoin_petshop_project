const SendMeEther = artifacts.require("SendMeEther");

module.exports = function(deployer) {
  deployer.deploy(SendMeEther);
};