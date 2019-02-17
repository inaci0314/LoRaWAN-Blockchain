var GatewayManager = artifacts.require("GatewayManager");

contract("GatewayManager", function (accounts) {
    //Adding objects//
    function addAdmin() {
        it("Admin should be added", function () {
            var instance;
            var _name = "Administrator 1";
            var _addr = accounts[1];
            return GatewayManager.deployed().then(function (_instance) {
                instance = _instance;
                return instance.addAdmin(_name, _addr);
            }).then(function () {
                return instance.adminMapping.call(_addr);
            }).then(function (admin) {
                assert.equal(admin[0], _name, "admin name '" + admin[0] + "' should be '" + _name + "'.\n");
                assert.isTrue(admin[1], "admin 'authorized' property should be set to true.\n");
                return instance.getAllAdminAddresses()
            }).then(function (admins) {
                assert.equal(admins[admins.length - 1], _addr, "Admin's address should be added to 'admins' array.\n");
            })
        });
    }
    addAdmin();

    it("Already admin accounts shouldn't be added a second time", function () {
        var instance;
        var _name = "Administrator 1";
        var _addr = accounts[1];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.addAdmin(_name, accounts[1]);
        }).then(function () {
            assert(false, "Existing admin account cannot be added a second time.\n");
        }).catch(function (err) {
            if (err.message == "Existing admin account cannot be added a second time.\n") {
                assert(false, "Existing admin account cannot be added a second time.\n");
            } else {
                assert(true, "Expected error when adding an already existing admin.\n");
            }
        });
    });

    function addGateway() {
        it("Gateway should be registered", function () {
            var instance;
            var _name = "South Africa 1";
            var _gatewayEUI = "1A:2B:3C:4D:5E:6F:7G";
            var _addr = accounts[2];
            return GatewayManager.deployed().then(function (_instance) {
                instance = _instance;
                return instance.registerGateway(_name, _gatewayEUI, _addr);
            }).then(function () {
                return instance.gatewayMapping.call(_addr);
            }).then(function (gateway) {
                assert.equal(gateway[0], _name, "gateway name '" + gateway[0] + "' should be '" + _name + "'.\n");
                assert.equal(gateway[1], _gatewayEUI, "gatewayEUI '" + gateway[1] + "' should be '" + _gatewayEUI + "'.\n");
                assert.isTrue(gateway[2], "gateway 'registered' property should be set to true.\n");
                return instance.getAllGatewayAddresses()
            }).then(function (gateways) {
                assert.equal(gateways[gateways.length - 1], _addr, "Gateway's address should be added to 'gateways' array.\n");
            })
        });
    }
    addGateway();

    it("Already registered gateway shouldn't be registerd a second time", function () {
        var instance;
        var _name = "South Africa 1";
        var _gatewayEUI = "1A:2B:3C:4D:5E:6F:7G";
        var _addr = accounts[2];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.registerGateway(_name, _gatewayEUI, _addr);
        }).then(function () {
            assert(false, "Registered gateway cannot be registered a second time.\n");
        }).catch(function (err) {
            if (err.message == "Registered gateway cannot be registered a second time.\n") {
                assert(false, "Registered gateway cannot be registered a second time.\n");
            } else {
                assert(true, "Expected error when registering already registered gateway.\n");
            }
        });
    });

    function addNode() {
        it("Node should be registered", function () {
            var instance;
            var _id = "0";
            var _devEUI = "7G:6F:5E:4D:3C:2B:1A";
            var _nodeAddr = accounts[3];
            var _gatewayAddr = accounts[2];
            return GatewayManager.deployed().then(function (_instance) {
                instance = _instance;
            }).then(function () {
                return instance.registerNode(_id, _devEUI, _nodeAddr, _gatewayAddr);
            }).then(function () {
                return instance.nodeMapping.call(_nodeAddr);
            }).then(function (node) {
                assert.equal(node[0], _id, "Node id '" + node[0] + "' should be '" + _id + "'.\n");
                assert.equal(node[1], _devEUI, "DevEUI '" + node[1] + "' should be '" + _devEUI + "'.\n");
                assert.isTrue(node[2], "Node 'registered' property should be set to true.\n");
                return instance.getAllNodeAddresses.call();
            }).then(function (nodes) {
                assert.equal(nodes[nodes.length - 1], _nodeAddr, "Node's address should be added in 'nodes' list.\n");
                return instance.getAssociatedNodes(_gatewayAddr);
            }).then(function (addrs) {
                assert.equal(addrs[addrs.length - 1], _nodeAddr, "Node's address should be added in associated gateway's 'nodes' list.\n");
                return instance.getAssociatedGateway(_nodeAddr);
            }).then(function (addr) {
                assert.equal(addr, _gatewayAddr, "Node's address should map to its associated gateway's address.\n");
            })
        });
    }
    addNode();

    it("Already registered node shouldn't be registerd a second time", function () {
        var instance;
        var _id = "0";
        var _devEUI = "7G:6F:5E:4D:3C:2B:1A";
        var _nodeAddr = accounts[3];
        var _gatewayAddr = accounts[2];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.registerNode(_id, _devEUI, _nodeAddr, _gatewayAddr);
        }).then(function () {
            assert(false, "Registered node cannot be registered a second time.\n");
        }).catch(function (err) {
            if (err.message == "Registered node cannot be registered a second time.\n") {
                assert(false, "Registered node cannot be registered a second time.\n");
            } else {
                assert(true, "Expected error when registering already registered node.\n");
            }
        });
    });

    it("Already assigned address should not be used for new objects", function () {
        var instance;
        //Admin//
        var _adminName = "Admin 2";
        var _adminAddr = accounts[1];
        //---//
        //Gateway//
        var _gatewayName = "Madagascar";
        var _gatewayEUI = "2B:3C:4D:5E:6F:7G:8H";
        var _gatewayAddr = accounts[2];
        //---//
        //Node//
        var _id = "0";
        var _devEUI = "8H:7G:6F:5E:4D:3C:2B";
        var _nodeAddr = accounts[3];
        //---//
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.addAdmin(_adminName, _adminAddr);
        }).then(function () {
            assert(false, "Already assigned address should not be used to add an administrator.\n");
        }).catch(function (err) {
            assert(true, "Expected error when using an already assigned address to add an administrator.\n");
        }).then(function () {
            return instance.registerGateway(_gatewayName, _gatewayEUI, _gatewayAddr);
        }).then(function () {
            assert(false, "Already assigned address should not be used to register a gateway.\n");
        }).catch(function (err) {
            assert(true, "Expected error when using already assigned address to register a gateway.\n");
        }).then(function () {
            return instance.registerNode(_id, _devEUI, _nodeAddr, _gatewayAddr);
        }).then(function () {
            assert(false, "Already assigned address should not be used to register a node.\n");
        }).catch(function (err) {
            assert(true, "Expected error when using already assigned address to register a node.\n");
        });
    });
    //-----//
    //Rights//
    it("Non-admin accounts should not be able to add an admin", function () {
        var instance;
        var _name = "Admin 2";
        var _addr = accounts[4];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.addAdmin(_name, _addr, { from: _addr });
        }).then(function () {
            assert(false, "Non-admin accounts should not be able to add an admin.\n");
        }).catch(function (err) {
            assert(true, "Expected error when adding an admin with a non-admin account.\n");
        });
    });

    it("Non-admin accounts should not be able to register a gateway", function () {
        var _name = "Madagascar";
        var _gatewayEUI = "2B:3C:4D:5E:6F:7G:8H";
        var _gatewayAddr = accounts[5];
        var _fromAddr = accounts[4];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.registerGateway(_name, _gatewayEUI, _gatewayAddr, { from: _fromAddr });
        }).then(function () {
            assert(false, "Non-admin accounts should not be able to register a gateway.\n");
        }).catch(function (err) {
            assert(true, "Expected error when registering a gateway with a non-admin account.\n");
        });
    });

    it("Non-admin accounts should not be able to register a node", function () {
        var _id = "1";
        var _devEUI = "8H:7G:6F:5E:4D:3C:2B";
        var _nodeAddr = accounts[6];
        var _gatewayAddr = accounts[2];
        var _fromAddr = accounts[4];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.registerNode(_id, _devEUI, _nodeAddr, _gatewayAddr, { from: _fromAddr });
        }).then(function () {
            assert(false, "Non-admin accounts should not be able to register a node.\n");
        }).catch(function (err) {
            assert(true, "Expected error when registering a node with a non-admin account.\n");
        });
    });

    it("Non-gateway accounts should not be able to set node location data", function () {
        var _devEUI = "7G:6F:5E:4D:3C:2B:1A";
        var _timestamp = "1550437491";
        var _latitude = "-33.945401";
        var _longitude = "24.037349";
        var _altitude = "570";
        var _batteryLvl = "97";
        var _fromAddr = accounts[4];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.setNodeLocationData(_devEUI, _timestamp, _latitude, _longitude, _altitude, _batteryLvl, { from: _fromAddr });
        }).then(function () {
            assert(false, "Non-gateway accounts should not be able to send node location data.\n");
        }).catch(function (err) {
            assert(true, "Expected error when sending node location data with a non-gateway account.\n");
        });
    });
    //-----//
    //Setting node data//
    /*
    it("Should set node location data", function () {
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            var _devEUI = "7G:6F:5E:4D:3C:2B:1A";
            var _timestamp = "1550437491";
            var _latitude = "-33.945401";
            var _longitude = "24.037349";
            var _altitude = "570";
            var _batteryLvl = "97";
            var _fromAddr = accounts[2];
            return instance.setNodeLocationData(_devEUI, _timestamp, _latitude, _longitude, _altitude, _batteryLvl, { from: _fromAddr });
        }).then(function () {
            return instance.getNodeLocationHistory(accounts[3]);
        }).then(function (data) {
            var expected = _timestamp + ", (" + _latitude + ", " + _longitude + ", " + _altitude + "), " + ", " + _batteryLvl;
            assert.equal(data, expected, "'" + data + "' should be '" + expected + "'.\n");
        });
    });
    */
    //-----//
    //"Removing" and re-adding objects//
    it("Admin should be removed", function () {
        var instance;
        var _addr = accounts[1];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.removeAdmin(_addr);
        }).then(function () {
            return instance.adminMapping.call(_addr);
        }).then(function (admin) {
            assert.isFalse(admin[1], "Removed admin 'authorized' property should be set to false.\n");
            return instance.getAllAdminAddresses.call();
        }).then(function (admins) {
            for (var i = 0; i < admins.length; i += 1) {
                if (admins[i] == _addr) {
                    assert(false, "Admin's address should be removed from 'admins' list.\n");
                }
            }
        });
    });

    addAdmin();

    it("Gateway should be removed", function () {
        var instance;
        var _addr = accounts[2];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.removeGateway(_addr);
        }).then(function () {
            return instance.gatewayMapping.call(_addr);
        }).then(function (gateway) {
            assert.isFalse(gateway[2], "Removed gateway's 'registered' property should be set to false.\n");
            return instance.getAllGatewayAddresses.call();
        }).then(function (gateways) {
            for (var i = 0; i < gateways.length; i += 1) {
                if (gateways[i] == _addr) {
                    console.log(i);
                    assert(false, "Gateway's address should be removed from 'gateways' list.\n");
                }
            }
        });
    });

    addGateway();

    it("Node should be removed", function () {
        var instance;
        var _addr = accounts[3];
        return GatewayManager.deployed().then(function (_instance) {
            instance = _instance;
            return instance.removeNode(_addr);
        }).then(function () {
            return instance.nodeMapping.call(_addr);
        }).then(function (node) {
            assert.isFalse(node[2], "Removed node's 'registered' property should be set to false.\n");
            return instance.getAllNodeAddresses.call();
        }).then(function (nodes) {
            for (var i = 0; i < nodes.length; i += 1) {
                if (nodes[i] == _addr) {
                    console.log(i);
                    assert(false, "Node's address should be removed from 'nodes' list.\n");
                }
            }
            //Getting error because gateway is no longer registered
            return instance.getAssociatedNodes(accounts[2]);
        }).then(function (nodes) {
            for (var i = 0; i < nodes.length; i += 1) {
                if (nodes[i] == _addr) {
                    console.log(nodes + " " + _addr);
                    assert(false, "Node's address should be removed from associated gateway's nodes' list.\n");
                }
            }
        });
    });
    //addNode();
    //-----//
});
