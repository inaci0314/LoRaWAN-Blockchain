var GatewayManager = artifacts.require("GatewayManager");

module.exports = function(deployer) {
    deployer.deploy(GatewayManager);
}