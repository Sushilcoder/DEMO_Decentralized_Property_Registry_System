// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PropertyRegistry
 * @dev Decentralized Property Registry with Role-Based Access Control
 * @notice Manages property registration, transfers, and disputes on blockchain
 */
contract PropertyRegistry {
    // ============ Enums ============
    enum PropertyStatus { Active, PendingTransfer, Blocked }
    enum TransferStatus { None, Initiated, Approved, Completed, Cancelled }

    // ============ Structs ============
    struct Property {
        uint256 propertyId;
        address owner;
        string ipfsHash;          // IPFS hash of property documents
        string location;
        uint256 area;             // in square meters
        string propertyType;      // e.g., "Residential", "Commercial", "Agricultural"
        uint256 registrationDate;
        PropertyStatus status;
        bool exists;
    }

    struct TransferRequest {
        uint256 propertyId;
        address seller;
        address buyer;
        uint256 price;
        uint256 initiatedAt;
        TransferStatus status;
        bool registrarApproved;
    }

    // ============ State Variables ============
    address public admin;
    uint256 public propertyCounter;
    uint256 public transferCounter;

    mapping(address => bool) public registrars;
    mapping(uint256 => Property) public properties;
    mapping(uint256 => TransferRequest) public transferRequests;
    mapping(address => uint256[]) public ownerProperties;
    mapping(string => bool) public ipfsHashUsed;

    // ============ Events ============
    event RegistrarAdded(address indexed registrar, address indexed addedBy);
    event RegistrarRemoved(address indexed registrar, address indexed removedBy);
    event PropertyRegistered(
        uint256 indexed propertyId,
        address indexed owner,
        string ipfsHash,
        string location,
        uint256 registrationDate
    );
    event TransferInitiated(
        uint256 indexed transferId,
        uint256 indexed propertyId,
        address indexed seller,
        address buyer,
        uint256 price
    );
    event TransferApproved(
        uint256 indexed transferId,
        uint256 indexed propertyId,
        address indexed approvedBy
    );
    event TransferCompleted(
        uint256 indexed transferId,
        uint256 indexed propertyId,
        address indexed newOwner
    );
    event TransferCancelled(
        uint256 indexed transferId,
        uint256 indexed propertyId,
        address indexed cancelledBy
    );
    event PropertyBlocked(
        uint256 indexed propertyId,
        address indexed blockedBy,
        string reason
    );
    event PropertyUnblocked(
        uint256 indexed propertyId,
        address indexed unblockedBy
    );

    // ============ Modifiers ============
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegistrar() {
        require(registrars[msg.sender], "Only registrar can perform this action");
        _;
    }

    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(properties[_propertyId].exists, "Property does not exist");
        require(properties[_propertyId].owner == msg.sender, "Only property owner can perform this action");
        _;
    }

    modifier propertyExists(uint256 _propertyId) {
        require(properties[_propertyId].exists, "Property does not exist");
        _;
    }

    modifier propertyNotBlocked(uint256 _propertyId) {
        require(properties[_propertyId].status != PropertyStatus.Blocked, "Property is blocked due to dispute");
        _;
    }

    // ============ Constructor ============
    constructor() {
        admin = msg.sender;
        registrars[msg.sender] = true; // Admin is also a registrar
        emit RegistrarAdded(msg.sender, msg.sender);
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Add a new registrar
     * @param _registrar Address of the new registrar
     */
    function addRegistrar(address _registrar) external onlyAdmin {
        require(_registrar != address(0), "Invalid address");
        require(!registrars[_registrar], "Already a registrar");
        registrars[_registrar] = true;
        emit RegistrarAdded(_registrar, msg.sender);
    }

    /**
     * @dev Remove a registrar
     * @param _registrar Address of the registrar to remove
     */
    function removeRegistrar(address _registrar) external onlyAdmin {
        require(registrars[_registrar], "Not a registrar");
        require(_registrar != admin, "Cannot remove admin as registrar");
        registrars[_registrar] = false;
        emit RegistrarRemoved(_registrar, msg.sender);
    }

    // ============ Registrar Functions ============

    /**
     * @dev Register a new property (Only Registrar)
     * @param _owner Address of the property owner
     * @param _ipfsHash IPFS hash of property documents
     * @param _location Property location
     * @param _area Property area in square meters
     * @param _propertyType Type of property
     */
    function registerProperty(
        address _owner,
        string calldata _ipfsHash,
        string calldata _location,
        uint256 _area,
        string calldata _propertyType
    ) external onlyRegistrar returns (uint256) {
        require(_owner != address(0), "Invalid owner address");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(bytes(_location).length > 0, "Location required");
        require(_area > 0, "Area must be greater than 0");
        require(!ipfsHashUsed[_ipfsHash], "Document already registered");

        propertyCounter++;
        uint256 newPropertyId = propertyCounter;

        properties[newPropertyId] = Property({
            propertyId: newPropertyId,
            owner: _owner,
            ipfsHash: _ipfsHash,
            location: _location,
            area: _area,
            propertyType: _propertyType,
            registrationDate: block.timestamp,
            status: PropertyStatus.Active,
            exists: true
        });

        ownerProperties[_owner].push(newPropertyId);
        ipfsHashUsed[_ipfsHash] = true;

        emit PropertyRegistered(
            newPropertyId,
            _owner,
            _ipfsHash,
            _location,
            block.timestamp
        );

        return newPropertyId;
    }

    /**
     * @dev Block a disputed property (Only Registrar)
     * @param _propertyId ID of the property to block
     * @param _reason Reason for blocking
     */
    function blockDisputedProperty(
        uint256 _propertyId,
        string calldata _reason
    ) external onlyRegistrar propertyExists(_propertyId) {
        require(properties[_propertyId].status != PropertyStatus.Blocked, "Property already blocked");
        
        properties[_propertyId].status = PropertyStatus.Blocked;
        
        // Cancel any pending transfer
        for (uint256 i = 1; i <= transferCounter; i++) {
            if (transferRequests[i].propertyId == _propertyId && 
                transferRequests[i].status == TransferStatus.Initiated) {
                transferRequests[i].status = TransferStatus.Cancelled;
            }
        }
        
        emit PropertyBlocked(_propertyId, msg.sender, _reason);
    }

    /**
     * @dev Unblock a property (Only Registrar)
     * @param _propertyId ID of the property to unblock
     */
    function unblockProperty(
        uint256 _propertyId
    ) external onlyRegistrar propertyExists(_propertyId) {
        require(properties[_propertyId].status == PropertyStatus.Blocked, "Property not blocked");
        
        properties[_propertyId].status = PropertyStatus.Active;
        emit PropertyUnblocked(_propertyId, msg.sender);
    }

    /**
     * @dev Approve a transfer request (Only Registrar)
     * @param _transferId ID of the transfer request
     */
    function approveTransfer(
        uint256 _transferId
    ) external onlyRegistrar {
        TransferRequest storage request = transferRequests[_transferId];
        require(request.status == TransferStatus.Initiated, "Transfer not in initiated state");
        require(!request.registrarApproved, "Already approved by registrar");
        
        Property storage property = properties[request.propertyId];
        require(property.status != PropertyStatus.Blocked, "Property is blocked");
        
        request.registrarApproved = true;
        request.status = TransferStatus.Approved;
        
        emit TransferApproved(_transferId, request.propertyId, msg.sender);
    }

    // ============ Owner Functions ============

    /**
     * @dev Initiate a property transfer (Only Property Owner)
     * @param _propertyId ID of the property
     * @param _buyer Address of the buyer
     * @param _price Sale price in wei
     */
    function initiateTransfer(
        uint256 _propertyId,
        address _buyer,
        uint256 _price
    ) external onlyPropertyOwner(_propertyId) propertyNotBlocked(_propertyId) returns (uint256) {
        require(_buyer != address(0), "Invalid buyer address");
        require(_buyer != msg.sender, "Cannot transfer to yourself");
        require(properties[_propertyId].status == PropertyStatus.Active, "Property not available for transfer");

        transferCounter++;
        uint256 newTransferId = transferCounter;

        transferRequests[newTransferId] = TransferRequest({
            propertyId: _propertyId,
            seller: msg.sender,
            buyer: _buyer,
            price: _price,
            initiatedAt: block.timestamp,
            status: TransferStatus.Initiated,
            registrarApproved: false
        });

        properties[_propertyId].status = PropertyStatus.PendingTransfer;

        emit TransferInitiated(
            newTransferId,
            _propertyId,
            msg.sender,
            _buyer,
            _price
        );

        return newTransferId;
    }

    /**
     * @dev Cancel a transfer request (Only Seller/Owner)
     * @param _transferId ID of the transfer request
     */
    function cancelTransfer(
        uint256 _transferId
    ) external {
        TransferRequest storage request = transferRequests[_transferId];
        require(request.seller == msg.sender || registrars[msg.sender], "Not authorized");
        require(
            request.status == TransferStatus.Initiated || 
            request.status == TransferStatus.Approved, 
            "Cannot cancel this transfer"
        );

        request.status = TransferStatus.Cancelled;
        properties[request.propertyId].status = PropertyStatus.Active;

        emit TransferCancelled(_transferId, request.propertyId, msg.sender);
    }

    // ============ Buyer Functions ============

    /**
     * @dev Complete a property transfer (Only Buyer, after registrar approval)
     * @param _transferId ID of the transfer request
     */
    function completeTransfer(
        uint256 _transferId
    ) external payable {
        TransferRequest storage request = transferRequests[_transferId];
        require(request.buyer == msg.sender, "Only buyer can complete transfer");
        require(request.status == TransferStatus.Approved, "Transfer not approved");
        require(request.registrarApproved, "Registrar approval required");
        require(msg.value >= request.price, "Insufficient payment");

        Property storage property = properties[request.propertyId];
        address previousOwner = property.owner;

        // Update property ownership
        property.owner = request.buyer;
        property.status = PropertyStatus.Active;
        request.status = TransferStatus.Completed;

        // Update owner properties mapping
        _removePropertyFromOwner(previousOwner, request.propertyId);
        ownerProperties[request.buyer].push(request.propertyId);

        // Transfer payment to seller
        payable(request.seller).transfer(request.price);

        // Refund excess payment
        if (msg.value > request.price) {
            payable(msg.sender).transfer(msg.value - request.price);
        }

        emit TransferCompleted(_transferId, request.propertyId, request.buyer);
    }

    // ============ View Functions ============

    /**
     * @dev Get property details
     * @param _propertyId ID of the property
     */
    function getPropertyDetails(
        uint256 _propertyId
    ) external view propertyExists(_propertyId) returns (
        uint256 propertyId,
        address owner,
        string memory ipfsHash,
        string memory location,
        uint256 area,
        string memory propertyType,
        uint256 registrationDate,
        PropertyStatus status
    ) {
        Property storage p = properties[_propertyId];
        return (
            p.propertyId,
            p.owner,
            p.ipfsHash,
            p.location,
            p.area,
            p.propertyType,
            p.registrationDate,
            p.status
        );
    }

    /**
     * @dev Get transfer request details
     * @param _transferId ID of the transfer request
     */
    function getTransferDetails(
        uint256 _transferId
    ) external view returns (
        uint256 propertyId,
        address seller,
        address buyer,
        uint256 price,
        uint256 initiatedAt,
        TransferStatus status,
        bool registrarApproved
    ) {
        TransferRequest storage t = transferRequests[_transferId];
        return (
            t.propertyId,
            t.seller,
            t.buyer,
            t.price,
            t.initiatedAt,
            t.status,
            t.registrarApproved
        );
    }

    /**
     * @dev Get all properties owned by an address
     * @param _owner Address of the owner
     */
    function getPropertiesByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }

    /**
     * @dev Check if an address is a registrar
     * @param _address Address to check
     */
    function isRegistrar(address _address) external view returns (bool) {
        return registrars[_address];
    }

    /**
     * @dev Get total number of registered properties
     */
    function getTotalProperties() external view returns (uint256) {
        return propertyCounter;
    }

    /**
     * @dev Get total number of transfer requests
     */
    function getTotalTransfers() external view returns (uint256) {
        return transferCounter;
    }

    // ============ Internal Functions ============

    function _removePropertyFromOwner(address _owner, uint256 _propertyId) internal {
        uint256[] storage props = ownerProperties[_owner];
        for (uint256 i = 0; i < props.length; i++) {
            if (props[i] == _propertyId) {
                props[i] = props[props.length - 1];
                props.pop();
                break;
            }
        }
    }
}
