/**
 * This NodeJS api would allow the AngularJS front-end to interact with the "GatewayManager" smart contract 
 * in order to retrieve node GPS data to display on the map
 */
//GetAllNodes using getAllNodeAddresses + getNodeInfo

// Import libraries
var Web3 = require('web3'),
    contract = require("truffle-contract"),
    path = require('path')
MyContractJSON = require('../../build/contracts/GatewayManager.json');

// Setup RPC connection   
var provider = new Web3.providers.HttpProvider("http://localhost:8545");


// Read JSON and attach RPC connection (Provider)
var MyContract = contract(MyContractJSON);
MyContract.setProvider(provider);

// Use Truffle as usual
MyContract.deployed().then(function (instance) {
    return instance.owner.call({ from: accounts[0] });
}).then(function (result) {
    console.log(result);
}).catch(function (err) {
    console.log(err);
});
