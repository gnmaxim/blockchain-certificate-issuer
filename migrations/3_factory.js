var Certificate = artifacts.require("./Certificate.sol");
var Issuer = artifacts.require("./Issuer.sol");

module.exports = function(deployer) {
    deployer.deploy(Certificate);
    deployer.link(Certificate, Issuer);
    deployer.deploy(Issuer);
};
