import { Property, PropertyStatus } from "./contract";

// In-memory store for registered properties (persisted to localStorage)
const STORAGE_KEY = "registered_properties";
const COUNTER_KEY = "property_counter";

export interface StoredProperty {
  propertyId: string; // Alphanumeric ID like "PROP004"
  owner: string;
  ipfsHash: string;
  location: string;
  area: number;
  propertyType: string;
  registrationDate: number;
  status: PropertyStatus;
  ownerName?: string;
  surveyNumber?: string;
  description?: string;
}

// Generate alphanumeric property ID
function generatePropertyId(counter: number): string {
  return `PROP${String(counter).padStart(3, "0")}`;
}

// Extract numeric part from property ID
export function extractNumericId(propertyId: string): number {
  const match = propertyId.match(/PROP(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  // Try parsing as plain number
  const num = parseInt(propertyId, 10);
  return isNaN(num) ? 0 : num;
}

// Get the counter from localStorage
function getCounter(): number {
  if (typeof window === "undefined") return 4; // Start after demo properties
  
  try {
    const stored = localStorage.getItem(COUNTER_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (e) {
    console.error("Failed to load counter from storage:", e);
  }
  return 4; // Start from 4 to not conflict with demo properties (1-3)
}

// Save counter to localStorage
function saveCounter(counter: number) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(COUNTER_KEY, counter.toString());
  } catch (e) {
    console.error("Failed to save counter to storage:", e);
  }
}

// Get all registered properties from localStorage
export function getRegisteredProperties(): Map<string, StoredProperty> {
  if (typeof window === "undefined") return new Map();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed).map(([k, v]) => [k, v as StoredProperty]));
    }
  } catch (e) {
    console.error("Failed to load properties from storage:", e);
  }
  return new Map();
}

// Save properties to localStorage
function saveProperties(properties: Map<string, StoredProperty>) {
  if (typeof window === "undefined") return;
  
  try {
    const obj = Object.fromEntries(properties);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error("Failed to save properties to storage:", e);
  }
}

// Register a new property
export function registerProperty(property: Omit<StoredProperty, "propertyId">): string {
  const properties = getRegisteredProperties();
  
  // Get next counter and generate alphanumeric ID
  const counter = getCounter();
  const propertyId = generatePropertyId(counter);
  
  const newProperty: StoredProperty = {
    ...property,
    propertyId,
    registrationDate: Math.floor(Date.now() / 1000),
    status: PropertyStatus.Active,
  };
  
  properties.set(propertyId, newProperty);
  saveProperties(properties);
  saveCounter(counter + 1);
  
  return propertyId;
}

// Get a property by alphanumeric ID (e.g., "PROP004")
export function getProperty(propertyId: string): StoredProperty | null {
  const properties = getRegisteredProperties();
  
  // Normalize the ID - try exact match first
  const upperCaseId = propertyId.toUpperCase();
  if (properties.has(upperCaseId)) {
    return properties.get(upperCaseId) || null;
  }
  
  // Try with PROP prefix if just a number was passed
  const numericId = extractNumericId(propertyId);
  if (numericId > 0) {
    const formattedId = generatePropertyId(numericId);
    return properties.get(formattedId) || null;
  }
  
  return null;
}

// Convert stored property to contract Property format
export function toContractProperty(stored: StoredProperty): Property {
  const numericId = extractNumericId(stored.propertyId);
  return {
    propertyId: BigInt(numericId),
    owner: stored.owner,
    ipfsHash: stored.ipfsHash,
    location: stored.location,
    area: BigInt(Math.floor(stored.area)),
    propertyType: stored.propertyType,
    registrationDate: BigInt(stored.registrationDate),
    status: stored.status,
  };
}

// Get total count of registered properties
export function getTotalRegisteredProperties(): number {
  return getRegisteredProperties().size;
}

// Demo properties data
export const DEMO_PROPERTIES: Record<string, StoredProperty> = {
  "PROP001": {
    propertyId: "PROP001",
    owner: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    ipfsHash: "QmYwAPJzv5CZsnANH5Qz9rM1gXf8vG8X8Z3Zq7q1qYrK1a",
    location: "123 Main Street, Mumbai, Maharashtra 400001",
    area: 1500,
    propertyType: "Residential",
    registrationDate: Math.floor(Date.now() / 1000) - 86400 * 30,
    status: PropertyStatus.Active,
    ownerName: "Rahul Sharma",
    surveyNumber: "MUM/123/A",
  },
  "PROP002": {
    propertyId: "PROP002",
    owner: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    ipfsHash: "QmZk3F7v5CZsnANH5Qz9rM1gXf8vG8X8Z3Zq7q1qYrK2b",
    location: "456 Park Avenue, Pune, Maharashtra 411001",
    area: 2500,
    propertyType: "Commercial",
    registrationDate: Math.floor(Date.now() / 1000) - 86400 * 60,
    status: PropertyStatus.Active,
    ownerName: "Priya Patel",
    surveyNumber: "PUN/456/B",
  },
  "PROP003": {
    propertyId: "PROP003",
    owner: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
    ipfsHash: "QmWk4G8v5CZsnANH5Qz9rM1gXf8vG8X8Z3Zq7q1qYrK3c",
    location: "789 Farm Road, Nashik, Maharashtra 422001",
    area: 5000,
    propertyType: "Agricultural",
    registrationDate: Math.floor(Date.now() / 1000) - 86400 * 90,
    status: PropertyStatus.Blocked,
    ownerName: "Amit Singh",
    surveyNumber: "NAS/789/C",
  },
};

// Get property including demo properties
export function getPropertyWithDemo(propertyId: string): StoredProperty | null {
  // First check user-registered properties
  const userProperty = getProperty(propertyId);
  if (userProperty) return userProperty;
  
  // Then check demo properties
  const upperCaseId = propertyId.toUpperCase();
  if (DEMO_PROPERTIES[upperCaseId]) {
    return DEMO_PROPERTIES[upperCaseId];
  }
  
  // Try with PROP prefix if just a number was passed
  const numericId = extractNumericId(propertyId);
  if (numericId > 0 && numericId <= 3) {
    const formattedId = `PROP${String(numericId).padStart(3, "0")}`;
    return DEMO_PROPERTIES[formattedId] || null;
  }
  
  return null;
}
