import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
// Sepolia Testnet RPC URL
const ALCHEMY_RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const SEPOLIA_CHAIN_ID = 11155111;
const AMOY_CHAIN_ID = 1337; // Declaring AMOY_CHAIN_ID here

// Property Registry contract configuration
const PROPERTY_REGISTRY_ABI = [
  "function getProperty(string propertyId) public view returns (address owner, string ipfsHash, string location, uint256 timestamp, bool exists)",
  "function verifyOwnership(string propertyId, address owner) public view returns (bool)",
];

// Demo contract address (replace with actual deployed contract)
const PROPERTY_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000";

// Demo properties for simulation
const demoProperties: Record<string, {
  owner: string;
  ipfsHash: string;
  location: string;
  timestamp: number;
  exists: boolean;
}> = {
  "PROP001": {
    owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f5bE21",
    ipfsHash: "QmDemo123456789abcdef",
    location: "Mumbai, Maharashtra",
    timestamp: Date.now() - 86400000 * 30,
    exists: true,
  },
  "PROP002": {
    owner: "0x8ba1f109551bD432803012645Hac136E22b4FCa",
    ipfsHash: "QmDemo987654321fedcba",
    location: "Pune, Maharashtra",
    timestamp: Date.now() - 86400000 * 60,
    exists: true,
  },
  "PROP003": {
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ipfsHash: "QmDemoABCDEF123456789",
    location: "Nashik, Maharashtra",
    timestamp: Date.now() - 86400000 * 90,
    exists: true,
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  const propertyId = searchParams.get("propertyId");

  if (!ALCHEMY_API_KEY) {
    return NextResponse.json(
      { error: "Alchemy API key not configured" },
      { status: 500 }
    );
  }

  try {
    if (action === "getProperty" && propertyId) {
      // Try real contract first, fall back to demo
      if (PROPERTY_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
        const contract = new ethers.Contract(
          PROPERTY_REGISTRY_ADDRESS,
          PROPERTY_REGISTRY_ABI,
          provider
        );
        
        const result = await contract.getProperty(propertyId);
        return NextResponse.json({
          owner: result[0],
          ipfsHash: result[1],
          location: result[2],
          timestamp: Number(result[3]),
          exists: result[4],
        });
      }

      // Demo mode
      const property = demoProperties[propertyId.toUpperCase()];
      if (property) {
        return NextResponse.json(property);
      }

      return NextResponse.json({
        owner: ethers.ZeroAddress,
        ipfsHash: "",
        location: "",
        timestamp: 0,
        exists: false,
      });
    }

    if (action === "getRpcUrl") {
      // Return the RPC URL for client-side wallet operations
      return NextResponse.json({ rpcUrl: ALCHEMY_RPC_URL });
    }

    if (action === "getNetworkInfo") {
      return NextResponse.json({
        chainId: SEPOLIA_CHAIN_ID,
        chainName: "Sepolia Testnet",
        rpcUrl: ALCHEMY_RPC_URL,
        blockExplorer: "https://sepolia.etherscan.io",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Blockchain API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blockchain data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, propertyId, ipfsHash, location, ownerAddress } = body;

    if (action === "simulateRegister") {
      // Simulate registration - in production this would verify signed transaction
      const txHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify({ propertyId, ipfsHash, location, ownerAddress, timestamp: Date.now() }))
      );

      // Add to demo properties (in-memory only for this session)
      demoProperties[propertyId.toUpperCase()] = {
        owner: ownerAddress,
        ipfsHash,
        location,
        timestamp: Date.now(),
        exists: true,
      };

      return NextResponse.json({
        success: true,
        transactionHash: txHash,
        message: "Property registered successfully (simulated)",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Blockchain POST error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
