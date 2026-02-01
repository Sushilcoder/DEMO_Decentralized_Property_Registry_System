const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PropertyMetadata {
  propertyId: string;
  ownerName: string;
  ownerAddress: string;
  location: string;
  area: string;
  surveyNumber: string;
  documentType: string;
  registrationDate: string;
  previousOwners?: string[];
  encumbrances?: string[];
}

export async function uploadFileToPinata(file: File): Promise<PinataResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET_KEY!,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to IPFS");
  }

  return response.json();
}

export async function uploadJSONToPinata(
  data: PropertyMetadata,
  name: string
): Promise<PinataResponse> {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET_KEY!,
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: {
        name: name,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload metadata to IPFS");
  }

  return response.json();
}

export function getIPFSUrl(hash: string): string {
  // Pinata dedicated gateway format
  const gateway = PINATA_GATEWAY;
  if (gateway && gateway.includes(".")) {
    // Full gateway domain provided
    return `https://${gateway}/ipfs/${hash}`;
  }
  // Gateway key provided - use Pinata's dedicated gateway format
  return `https://gateway.pinata.cloud/ipfs/${hash}?pinataGatewayToken=${gateway}`;
}

export async function fetchFromIPFS<T>(hash: string): Promise<T> {
  const response = await fetch(getIPFSUrl(hash));
  if (!response.ok) {
    throw new Error("Failed to fetch from IPFS");
  }
  return response.json();
}
