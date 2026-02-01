import { ethers } from "ethers";

// ============ CONTRACT ADDRESS ============
// Deploy the contract to Polygon Amoy and paste the address here
export const PROPERTY_REGISTRY_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

// ============ ENUMS ============
export enum PropertyStatus {
  Active = 0,
  PendingTransfer = 1,
  Blocked = 2,
}

export enum TransferStatus {
  None = 0,
  Initiated = 1,
  Approved = 2,
  Completed = 3,
  Cancelled = 4,
}

// ============ INTERFACES ============
export interface Property {
  propertyId: bigint;
  owner: string;
  ipfsHash: string;
  location: string;
  area: bigint;
  propertyType: string;
  registrationDate: bigint;
  status: PropertyStatus;
}

export interface TransferRequest {
  propertyId: bigint;
  seller: string;
  buyer: string;
  price: bigint;
  initiatedAt: bigint;
  status: TransferStatus;
  registrarApproved: boolean;
}

// ============ CONTRACT ABI ============
export const PROPERTY_REGISTRY_ABI = [
  // Constructor
  "constructor()",

  // Events
  "event RegistrarAdded(address indexed registrar, address indexed addedBy)",
  "event RegistrarRemoved(address indexed registrar, address indexed removedBy)",
  "event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string ipfsHash, string location, uint256 registrationDate)",
  "event TransferInitiated(uint256 indexed transferId, uint256 indexed propertyId, address indexed seller, address buyer, uint256 price)",
  "event TransferApproved(uint256 indexed transferId, uint256 indexed propertyId, address indexed approvedBy)",
  "event TransferCompleted(uint256 indexed transferId, uint256 indexed propertyId, address indexed newOwner)",
  "event TransferCancelled(uint256 indexed transferId, uint256 indexed propertyId, address indexed cancelledBy)",
  "event PropertyBlocked(uint256 indexed propertyId, address indexed blockedBy, string reason)",
  "event PropertyUnblocked(uint256 indexed propertyId, address indexed unblockedBy)",

  // Admin Functions
  "function addRegistrar(address _registrar) external",
  "function removeRegistrar(address _registrar) external",

  // Registrar Functions
  "function registerProperty(address _owner, string calldata _ipfsHash, string calldata _location, uint256 _area, string calldata _propertyType) external returns (uint256)",
  "function blockDisputedProperty(uint256 _propertyId, string calldata _reason) external",
  "function unblockProperty(uint256 _propertyId) external",
  "function approveTransfer(uint256 _transferId) external",

  // Owner Functions
  "function initiateTransfer(uint256 _propertyId, address _buyer, uint256 _price) external returns (uint256)",
  "function cancelTransfer(uint256 _transferId) external",

  // Buyer Functions
  "function completeTransfer(uint256 _transferId) external payable",

  // View Functions
  "function getPropertyDetails(uint256 _propertyId) external view returns (uint256 propertyId, address owner, string memory ipfsHash, string memory location, uint256 area, string memory propertyType, uint256 registrationDate, uint8 status)",
  "function getTransferDetails(uint256 _transferId) external view returns (uint256 propertyId, address seller, address buyer, uint256 price, uint256 initiatedAt, uint8 status, bool registrarApproved)",
  "function getPropertiesByOwner(address _owner) external view returns (uint256[] memory)",
  "function isRegistrar(address _address) external view returns (bool)",
  "function getTotalProperties() external view returns (uint256)",
  "function getTotalTransfers() external view returns (uint256)",

  // Public State Variables
  "function admin() external view returns (address)",
  "function propertyCounter() external view returns (uint256)",
  "function transferCounter() external view returns (uint256)",
  "function registrars(address) external view returns (bool)",
];

// ============ JSON ABI (for export/deployment tools) ============
export const PROPERTY_REGISTRY_JSON_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "propertyId", type: "uint256" },
      { indexed: true, name: "blockedBy", type: "address" },
      { indexed: false, name: "reason", type: "string" }
    ],
    name: "PropertyBlocked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "propertyId", type: "uint256" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "ipfsHash", type: "string" },
      { indexed: false, name: "location", type: "string" },
      { indexed: false, name: "registrationDate", type: "uint256" }
    ],
    name: "PropertyRegistered",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "propertyId", type: "uint256" },
      { indexed: true, name: "unblockedBy", type: "address" }
    ],
    name: "PropertyUnblocked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "registrar", type: "address" },
      { indexed: true, name: "addedBy", type: "address" }
    ],
    name: "RegistrarAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "registrar", type: "address" },
      { indexed: true, name: "removedBy", type: "address" }
    ],
    name: "RegistrarRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "transferId", type: "uint256" },
      { indexed: true, name: "propertyId", type: "uint256" },
      { indexed: true, name: "approvedBy", type: "address" }
    ],
    name: "TransferApproved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "transferId", type: "uint256" },
      { indexed: true, name: "propertyId", type: "uint256" },
      { indexed: true, name: "cancelledBy", type: "address" }
    ],
    name: "TransferCancelled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "transferId", type: "uint256" },
      { indexed: true, name: "propertyId", type: "uint256" },
      { indexed: true, name: "newOwner", type: "address" }
    ],
    name: "TransferCompleted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "transferId", type: "uint256" },
      { indexed: true, name: "propertyId", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "buyer", type: "address" },
      { indexed: false, name: "price", type: "uint256" }
    ],
    name: "TransferInitiated",
    type: "event"
  },
  {
    inputs: [{ name: "_registrar", type: "address" }],
    name: "addRegistrar",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "admin",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_transferId", type: "uint256" }],
    name: "approveTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_propertyId", type: "uint256" },
      { name: "_reason", type: "string" }
    ],
    name: "blockDisputedProperty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_transferId", type: "uint256" }],
    name: "cancelTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_transferId", type: "uint256" }],
    name: "completeTransfer",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "_propertyId", type: "uint256" }],
    name: "getPropertyDetails",
    outputs: [
      { name: "propertyId", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "ipfsHash", type: "string" },
      { name: "location", type: "string" },
      { name: "area", type: "uint256" },
      { name: "propertyType", type: "string" },
      { name: "registrationDate", type: "uint256" },
      { name: "status", type: "uint8" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_owner", type: "address" }],
    name: "getPropertiesByOwner",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalProperties",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalTransfers",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_transferId", type: "uint256" }],
    name: "getTransferDetails",
    outputs: [
      { name: "propertyId", type: "uint256" },
      { name: "seller", type: "address" },
      { name: "buyer", type: "address" },
      { name: "price", type: "uint256" },
      { name: "initiatedAt", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "registrarApproved", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "_propertyId", type: "uint256" },
      { name: "_buyer", type: "address" },
      { name: "_price", type: "uint256" }
    ],
    name: "initiateTransfer",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_address", type: "address" }],
    name: "isRegistrar",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "propertyCounter",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_ipfsHash", type: "string" },
      { name: "_location", type: "string" },
      { name: "_area", type: "uint256" },
      { name: "_propertyType", type: "string" }
    ],
    name: "registerProperty",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "registrars",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_registrar", type: "address" }],
    name: "removeRegistrar",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "transferCounter",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_propertyId", type: "uint256" }],
    name: "unblockProperty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

// ============ CONTRACT HELPER CLASS ============
export class PropertyRegistryContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;
  private isDemo: boolean = false;

  constructor(
    signerOrProvider: ethers.Provider | ethers.Signer | null,
    contractAddress: string = PROPERTY_REGISTRY_ADDRESS
  ) {
    this.isDemo = !contractAddress || contractAddress === "YOUR_CONTRACT_ADDRESS_HERE";
    
    if (this.isDemo) {
      // Demo mode - no real contract
      this.contract = null as unknown as ethers.Contract;
      return;
    }
    
    if (signerOrProvider && 'getAddress' in signerOrProvider) {
      this.signer = signerOrProvider as ethers.Signer;
      this.contract = new ethers.Contract(contractAddress, PROPERTY_REGISTRY_ABI, signerOrProvider);
    } else if (signerOrProvider) {
      this.contract = new ethers.Contract(contractAddress, PROPERTY_REGISTRY_ABI, signerOrProvider);
    } else {
      this.contract = null as unknown as ethers.Contract;
    }
  }

  // Check if in demo mode
  isDemoMode(): boolean {
    return this.isDemo;
  }

  // ============ Admin Functions ============
  async addRegistrar(registrarAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("addRegistrar");
    if (!this.signer) throw new Error("Signer required");
    return await this.contract.addRegistrar(registrarAddress);
  }

  async removeRegistrar(registrarAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("removeRegistrar");
    if (!this.signer) throw new Error("Signer required");
    return await this.contract.removeRegistrar(registrarAddress);
  }

  // ============ Registrar Functions ============
  async registerProperty(
    ownerAddress: string,
    ipfsHash: string,
    location: string,
    area: number,
    propertyType: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("registerProperty");
    if (!this.signer) throw new Error("Signer required");
    return await this.contract.registerProperty(
      ownerAddress,
      ipfsHash,
      location,
      area,
      propertyType
    );
  }

  async blockDisputedProperty(
    propertyId: number,
    reason: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("blockDisputedProperty");
    if (!this.signer) throw new Error("Signer required");
    return await this.contract.blockDisputedProperty(propertyId, reason);
  }

  async unblockProperty(propertyId: number): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("unblockProperty");
    if (!this.signer) throw new Error("Signer required");
    return await this.contract.unblockProperty(propertyId);
  }

  async approveTransfer(transferId: number): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("approveTransfer");
    if (!this.signer) throw new Error("Signer required");
    return await this.contract.approveTransfer(transferId);
  }

  // ============ Owner Functions ============
  async initiateTransfer(
    propertyId: number,
    buyerAddress: string,
    priceInMatic: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("initiateTransfer");
    if (!this.signer) throw new Error("Signer required");
    const priceInWei = ethers.parseEther(priceInMatic);
    return await this.contract.initiateTransfer(propertyId, buyerAddress, priceInWei);
  }

  async cancelTransfer(transferId: number): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("cancelTransfer");
    if (!this.signer) throw new Error("Signer required");
    return await this.contract.cancelTransfer(transferId);
  }

  // ============ Buyer Functions ============
  async completeTransfer(
    transferId: number,
    priceInMatic: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (this.isDemo) return this.simulateTransaction("completeTransfer");
    if (!this.signer) throw new Error("Signer required");
    const priceInWei = ethers.parseEther(priceInMatic);
    return await this.contract.completeTransfer(transferId, { value: priceInWei });
  }

  // ============ View Functions ============
  async getPropertyDetails(propertyId: string): Promise<Property | null> {
    if (this.isDemo) {
      try {
        // Fetch from Supabase database via API
        const response = await fetch(`/api/properties?propertyId=${encodeURIComponent(propertyId)}`);
        
        if (!response.ok) {
          console.warn(`Property not found: ${propertyId}`);
          return null;
        }
        
        const data = await response.json();
        
        // If data is null or undefined, property doesn't exist
        if (!data || typeof data !== 'object' || !data.owner_address) {
          console.warn(`Property data is invalid for ID: ${propertyId}`);
          return null;
        }
        
        // Convert stored property to contract property format
        // Status is stored as integer: 0 = Active, 1 = PendingTransfer, 2 = Blocked
        const statusValue = typeof data.status === 'string' 
          ? (data.status === 'active' ? 0 : data.status === 'pending_transfer' ? 1 : 2)
          : (data.status || 0);
        
        return {
          propertyId: BigInt(data.id || 1),
          owner: data.owner_address,
          ipfsHash: data.ipfs_hash,
          location: data.location,
          area: BigInt(data.area || 0),
          propertyType: data.property_type,
          registrationDate: BigInt(Math.floor(new Date(data.created_at).getTime() / 1000)),
          status: statusValue as PropertyStatus,
        };
      } catch (error) {
        console.error("Error fetching property from database:", error);
        return null;
      }
    }
    
    try {
      const result = await this.contract.getPropertyDetails(propertyId);
      return {
        propertyId: result[0],
        owner: result[1],
        ipfsHash: result[2],
        location: result[3],
        area: result[4],
        propertyType: result[5],
        registrationDate: result[6],
        status: Number(result[7]) as PropertyStatus,
      };
    } catch {
      return null;
    }
  }

  async getTransferDetails(transferId: number): Promise<TransferRequest | null> {
    if (this.isDemo) return null;
    
    try {
      const result = await this.contract.getTransferDetails(transferId);
      return {
        propertyId: result[0],
        seller: result[1],
        buyer: result[2],
        price: result[3],
        initiatedAt: result[4],
        status: Number(result[5]) as TransferStatus,
        registrarApproved: result[6],
      };
    } catch {
      return null;
    }
  }

  async getPropertiesByOwner(ownerAddress: string): Promise<bigint[]> {
    if (this.isDemo) return [];
    return await this.contract.getPropertiesByOwner(ownerAddress);
  }

  async isRegistrar(address: string): Promise<boolean> {
    if (this.isDemo) return true; // Demo mode - everyone is registrar
    return await this.contract.isRegistrar(address);
  }

  async getTotalProperties(): Promise<bigint> {
    if (this.isDemo) return BigInt(0);
    return await this.contract.getTotalProperties();
  }

  async getTotalTransfers(): Promise<bigint> {
    if (this.isDemo) return BigInt(0);
    return await this.contract.getTotalTransfers();
  }

  async getAdmin(): Promise<string> {
    if (this.isDemo) return "0x0000000000000000000000000000000000000000";
    return await this.contract.admin();
  }

  // Simulate transaction for demo mode
  private simulateTransaction(method: string): ethers.ContractTransactionResponse {
    const hash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify({ method, timestamp: Math.floor(Date.now()), random: Math.floor(Math.random() * 1000000) }))
    );
    
    return {
      hash,
      wait: async () => ({
        status: 1,
        hash,
        blockNumber: 12345678,
        blockHash: hash,
        transactionHash: hash,
        logs: [],
      }),
    } as unknown as ethers.ContractTransactionResponse;
  }
}

// ============ UTILITY FUNCTIONS ============
export function getStatusLabel(status: PropertyStatus): string {
  switch (status) {
    case PropertyStatus.Active:
      return "Active";
    case PropertyStatus.PendingTransfer:
      return "Pending Transfer";
    case PropertyStatus.Blocked:
      return "Blocked (Disputed)";
    default:
      return "Unknown";
  }
}

export function getTransferStatusLabel(status: TransferStatus): string {
  switch (status) {
    case TransferStatus.None:
      return "None";
    case TransferStatus.Initiated:
      return "Initiated";
    case TransferStatus.Approved:
      return "Approved";
    case TransferStatus.Completed:
      return "Completed";
    case TransferStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function formatArea(area: bigint): string {
  return `${area.toString()} sq.m`;
}

export function formatPrice(priceInWei: bigint): string {
  return `${ethers.formatEther(priceInWei)} MATIC`;
}
