# Blockchain Truffle Project
This project will allow to manage administrators, gateways, nodes and its data.
All these functionnalities are currently managed by one single contract. Ideally, the different tasks would be divided in multiple contracts.

## Getting Started
Clone the git repository using:
```
git clone https://gitlab.epai-ict.ch/m526/lorawan-blockchain.git
```
Navigate to the truffle project using:
```
cd ./blockchain
```
Deploy the contracts to a local private blockchain using:
```
truffle migrate
```
To deploy to another blockchain, add your network by modifying "truffle.js" (unix systems) or "truffle-config.js" (windows) according to your network's information.
If you modified the "development" network, you can use the command above to deploy the contracts, otherwise, use:
(replace <network name> with the network name you gave in the truffle configuration file)
```
truffle migrate --network <network name>
```
To re-deploy the contracts :
```
truffle migrate --reset
```
or
```
truffle migrate --network <netowrk name> --reset
```
To run the NodeJS server api (Not finished, will allow the frontend to retrieve information from the contract) :
```
node ./src/js/api.js
```

## Pre-requisites
* Truffle
* NodeJS
* Ganache (private local blockchain)

## Functionnalities
* Administrator actions (can only be performed by admins or the owner) :
  * Add/remove administrator accounts
  * Register/remove a gateway
  * Register/remove a node
* Gateway actions (can only be performed by gateway accounts) :
  * Set node location data
* Anyone (can be performed by anyone with an account) :
  * Retrieve all gateways addresses
  * Retrieve all nodes addresses
  * Retrieve administrator information through address (name for now)
  * Retrieve gateway data through address (name, gatewayEUI)
  * Retrieve node data through address (id, devEUI and associated gateway address)
  * Retrieve gateway's associated nodes' addresses through gateway address
  * Retrieve node's location history
  
## Limitations
* Browser crashes in Remix IDE when sending node data containing strings with length over 0. (Ideally, gateway information, node information and node location data would be stored using swarm and accessed using a smart contract)
* Had to set gas limit in Remix IDE from 3000000 to 4000000 to be able to deploy the contract
* Contract interactions as well as contract deployment are too costly
* Gateway/Node identification information that is represented by a string is not verified (for example, the devEUI of a node should have the format "XX:XX:XX:XX:XX:XX:XX", where "X" can be whether a letter or a number, but any string can be used)
* There's still a link between a gateway and its nodes when the gateway is removed