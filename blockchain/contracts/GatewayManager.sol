pragma solidity ^0.5.0;

/**
 * This contract allows the user to manage the different LoRa gateways, nodes and data sent by hem
 */
contract GatewayManager {
    address public owner;
     
    
    constructor() payable public {
        owner = msg.sender;
    }

    struct Gateway {
        string name;
        string gatewayEUI; //unique identifier
        address[] nodes;
        bool registered;
    }
    
    struct Node {
        string id;
        string devEUI; //unique identifier
        
        //Array of strings in format "%timestamp%, %GPS coordinates%, %batteryLevel%"
        //%location% = "(Latitude, Longitude, Altitude)"
        //Altitude is represented in meters
        string[] locationHistory;
        bool registered;
    }
    
    struct Admin {
        string name;
        bool authorized;
    }
    
    mapping(address => Gateway) public gatewayMapping; //Maps a gateway address to its Gateway object instance
    mapping(address => Admin) public adminMapping; //Maps an admin address to its Admin object instance
    mapping(address => Node) public nodeMapping; //Maps a node address to a Node object instance
    mapping(address => address) public nodeGatewayMapping; //Maps a node address to its associated gateway address
    
    address[] public admins;
    address[] public gateways;
    address[] public nodes; //Note: Every node (LoRa emitter) will have an address to identifiy them, even if the account isn't used
    
    enum AccountHolder {
        OWNER,
        ADMIN,
        GATEWAY,
        NODE,
        NULL
    }

    
    event AdminAdded(string name, address addr);
    /*
    event AdminRemoved(string name, address addr);
    
    event GatewayAdded(string name, string gatewayEUI, address addr);
    event GatewayRemoved(string name, string gatewayEUI, address addr);
    
    event NodeAdded(string name, string devEUI, address nodeAddr, address gatewayAddr);
    event NodeRemoved(string name, string devEUI, address nodeAddr, address gatewayAddr);
    
    event LocationDataAdded(address nodeAddr, string data);
    */

    modifier adminAction() {
        require(msg.sender == owner || isAdmin(msg.sender), "Only admin accounts can perform this action.");
        _;
    }
    
    modifier gatewayAction() {
        require(isGateway(msg.sender), "Only gateway accounts can perform this action.");
        _;
    }
    
        //the given address shouldn't correspond to any object in this contract (Admin, Gateway, Node or owner);
    modifier notAssigned(address _addr) {
        (bool b, AccountHolder who) = isAssigned(_addr);
        string memory s;
        
        if (b) {
            if(who == AccountHolder.OWNER) {
                s = "owner";
            } else if(who == AccountHolder.ADMIN) {
                s = "admin";
            } else if(who == AccountHolder.GATEWAY) {
                s = "gateway";
            } else if(who == AccountHolder.NODE) {
                s = "node";
            }
            revert(strConcat("Account already assigned as ", s, ".", "", ""));
        }
        _;
    }

    /*function getAdminInfo(address _addr) public view returns (string memory name) {
        Admin memory a = adminMapping[_addr];
        
        if(!a.authorized) {
            revert("The given address is not an admin address or account is not yet authorized");
        }
        
        return (a.name);
    }    
    
    function getGatewayInfo(address _addr) public view returns(string memory name, string memory gatewayEUI) {
        Gateway memory g = gatewayMapping[_addr];
        if (!g.registered) {
            revert("The given address is not a gateway address or gateway is not yet registered");
        }
        return (g.name, g.gatewayEUI);
    }
    
    function getNodeInfo(address _addr) public view returns(string memory name, string memory devEUI, address gatewayAddr) {
        Node memory n = nodeMapping[_addr];
        if(!n.registered) {
            revert("The given address is not a node address or node is not yet registered");
        }
        
        return (n.id, n.devEUI, nodeGatewayMapping[_addr]);
    }*/
    
    function isAdmin(address _addr) public view returns (bool) {
        return adminMapping[_addr].authorized;
    }
    
    function isGateway(address _addr) public view returns(bool) {
        return gatewayMapping[_addr].registered;
    }
    
    function isNode(address _addr) public view returns(bool) {
        return nodeMapping[_addr].registered;
    }
        
    function isAssigned(address _addr) internal view returns(bool, AccountHolder) {
        bool b;
        AccountHolder who;
        
        if(_addr == owner) {
            who = AccountHolder.OWNER;
            b = true;
        } else if(isAdmin(_addr)) {
            who = AccountHolder.ADMIN;
            b = true;
        } else if(isGateway(_addr)) {
            who = AccountHolder.GATEWAY;
            b = true;
        } else if(isNode(_addr)) {
            who = AccountHolder.NODE;
            b = true;
        } else {
            who = AccountHolder.NULL;
            b = false;
        }
        
        return (b, who);
    }
    
    /**
     * Returns the address of the gateway associated to this node
     */
    function getAssociatedGateway(address _nodeAddr) public view returns(address) {
        //Checks if the given address is a node address
        require(isNode(_nodeAddr), "Address given is not a node address or the node is not yet registered");
        return nodeGatewayMapping[_nodeAddr];
    }
    
    /**
     * Returns a list of all associated nodes addresses
     */
    function getAssociatedNodes(address _gatewayAddr) public view returns(address[] memory) {
        //Checks if the given address is a gateway address
        require(isGateway(_gatewayAddr), "Address given is not a gateway address or the gateway is not yet registered");
        return gatewayMapping[_gatewayAddr].nodes;
    }

    function getAllAdminAddresses() public view returns(address[] memory) {
        return admins;
    }

    function getAllGatewayAddresses() public view returns(address[] memory) {
        return gateways;
    }
    
    function getAllNodeAddresses() public view returns(address[]  memory) {
        return nodes;
    }

    
    /**
     * Returns a concatenation of all strings in the node's locationHistory[] array, separated by a ";"
     */
    function getNodeLocationHistory(address _addr) public view returns(string memory packedData) {
        string[] memory l = nodeMapping[_addr].locationHistory;
        string memory res = "";
        
        for (uint i = 0; i < l.length; i += 1) {
            res = strConcat(res, l[i], "", "", "");
            
            if(i != l.length-1) {
                res = strConcat(res, ";", "", "", "");
            }
        }
        
        return res;
    }
    
    function findNodeAddress(string memory _devEUI) public view returns(address) {
        for(uint i = 0; i < nodes.length; i += 1) {
            Node memory n = nodeMapping[nodes[i]];
            if (compareStrings(n.devEUI, _devEUI)) {
                return nodes[i];
            }
        }
        
        revert("Node address not found");
    }

    function addAdmin(string memory _name, address _addr) public adminAction notAssigned(_addr) {
        Admin memory a = Admin({name: _name, authorized: true});
        admins.push(_addr);
        adminMapping[_addr] = a;

        emit AdminAdded(_name, _addr);
    }
    
    function registerGateway(string memory _name, string memory _gatewayEUI, address _addr) public adminAction notAssigned(_addr) {
        Gateway memory g = Gateway({name: _name, gatewayEUI: _gatewayEUI, registered: true, nodes: new address[](0)});
        gateways.push(_addr);
        gatewayMapping[_addr] = g;
        
        //emit GatewayAdded(_name, _gatewayEUI, _addr);
    }
    
    function registerNode( string memory _id, string memory _devEUI, address _nodeAddr, address _gatewayAddr) public adminAction
    notAssigned(_nodeAddr) {
        //Check if gateway exists
        require(isGateway(_gatewayAddr), "The address given is not a gateway address or the gateway is not yet registered");
        
        Node memory n = Node({id: _id, devEUI: _devEUI, registered: true, locationHistory: new string[](0)});
        //Map node address to its object
        nodeMapping[_nodeAddr] = n;
        //Maps node address to its associated gateway
        nodeGatewayMapping[_nodeAddr] = _gatewayAddr;
        //Pushes node address to nodes array, representng all nodes managed by this contract
        nodes.push(_nodeAddr);
        //Pushes node's address to the given gateway's nodes list, representing all gateway's associated nodes
        gatewayMapping[_gatewayAddr].nodes.push(_nodeAddr);
        
        //emit NodeAdded(_id, _devEUI, _nodeAddr, _gatewayAddr);
    }
    
    function removeAdmin(address _addr) public adminAction {
        //Check if account is admin
        require(isAdmin(_addr), "The given address isn't an admin account or admin already removed.");

        Admin storage a = adminMapping[_addr];
        a.authorized = false;
        
        //remove admin's address from "admins" array
        for(uint i = 0; i < admins.length; i += 1) {
            uint index;
            if (admins[i] == _addr) {
                index = i;
            } else if (i > index) {
                admins[i] = admins[i-1];
            }
        }
        
        admins.length -= 1;

        //emit AdminRemoved(a.name, _addr);
    }
    
    function removeGateway(address _addr) public adminAction {
        //Check if gateway exists
        require(gatewayMapping[_addr].registered, "The given address isn't a gateway address or gateway is already removed");
        //Change ggateway "registered" to false
        Gateway storage g = gatewayMapping[_addr];
        g.registered = false;
        
        //remove gateway's address from "gateways" list
        for(uint i = 0; i < gateways.length; i += 1) {
            uint index; 
            if (gateways[i] == _addr) {
                index = i;
            } else if (i > index) {
                gateways[i] = gateways[i-1];
            }
        }
        
        gateways.length -= 1;
        
        //emit GatewayRemoved(g.name, g.gatewayEUI, _addr);
    }
    
    function removeNode(address _nodeAddr) public adminAction {
        //Check if node exists
        require(nodeMapping[_nodeAddr].registered, "The given address isn't a node address or node is already removed");
        //Change node "registered" to false
        Node storage n = nodeMapping[_nodeAddr];
        n.registered = false;
        
        //Remove node's address from "nodes" list
        for(uint i = 0; i < nodes.length; i += 1) {
            uint index;
            if (nodes[i] == _nodeAddr) {
                index = i;
            } else if (i > index) {
                nodes[i] = nodes[i-1];
            }
        }

        nodes.length -= 1;
        
        //Remove node from associated gateway's "nodes" list
        address[] storage _nodes = gatewayMapping[nodeGatewayMapping[_nodeAddr]].nodes;
        for(uint i = 0; i < _nodes.length; i += 1) {
            uint index;
            
            if (_nodes[i] == _nodeAddr) {
                index = i;
            } else if (i > index) {
                _nodes[i] = _nodes[i-1];
            }
        }

        _nodes.length -= 1;
        
        //emit NodeRemoved(n.id, n.devEUI, _nodeAddr, nodeGatewayMapping[_nodeAddr]);
    }
    
    function setNodeLocationData(string memory devEUI, string memory timestamp, string memory latitude, string memory longitude, string memory altitude, string memory batteryLevel) public gatewayAction {
        address _nodeAddr = findNodeAddress(devEUI);
        string memory coordinates = strConcat("(", latitude, ", ", longitude, ", ");
        coordinates = strConcat(coordinates, altitude, ")", "", "");
        string memory res = strConcat(timestamp, ", ", coordinates, ",", batteryLevel);
        
        nodeMapping[_nodeAddr].locationHistory.push(res);
        
        //emit LocationDataAdded(_nodeAddr, res);
    }
    
    //HELPER//
     /**
     * Helper functions for string concatenation 
     * (http://cryptodir.blogspot.com.tr/2016/03/solidity-concat-string.html)
     */
    function strConcat(string memory _a, string memory _b, string memory _c, string memory _d, string memory _e)
    internal pure returns (string memory){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (uint i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (uint i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (uint i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (uint i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }

    /*
    function strConcat(string memory _a, string memory _b, string memory _c, string memory _d)  public pure returns (string memory) {
        return strConcat(_a, _b, _c, _d, "");
    }
    
    function strConcat(string memory _a, string memory _b, string memory _c) public pure returns (string memory) {
        return strConcat(_a, _b, _c, "", "");
    }
    
    function strConcat(string memory _a, string memory _b) public pure returns (string memory) {
        return strConcat(_a, _b, "", "", "");
    }
    */
    
    /**
     * Helper function to compare strings
     */
    function compareStrings(string memory a, string memory b) internal pure returns (bool){
        bytes memory aBytes = bytes(a);
        bytes memory bBytes = bytes(b);
        return keccak256(aBytes) == keccak256(bBytes);
    }
}