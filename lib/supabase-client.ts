import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Status mapping: 0 = active, 1 = blocked, 2 = pending_transfer
const STATUS_MAP: Record<string, number> = {
  active: 0,
  blocked: 1,
  pending_transfer: 2,
};

const REVERSE_STATUS_MAP: Record<number, string> = {
  0: "active",
  1: "blocked",
  2: "pending_transfer",
};

export interface StoredProperty {
  id: string;
  property_id: string;
  owner_address: string;
  owner_name: string;
  location: string;
  area: number;
  property_type: string;
  survey_number: string;
  description: string;
  ipfs_hash: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export async function createProperty(property: Omit<StoredProperty, "id" | "created_at" | "updated_at" | "status"> & { status?: string | number }) {
  // Convert string status to integer if needed
  const statusValue = typeof property.status === "string" ? STATUS_MAP[property.status] || 0 : (property.status || 0);
  
  const { data, error } = await supabase
    .from("properties")
    .insert([
      {
        property_id: property.property_id,
        owner_address: property.owner_address,
        owner_name: property.owner_name,
        location: property.location,
        area: property.area,
        property_type: property.property_type,
        survey_number: property.survey_number,
        description: property.description,
        ipfs_hash: property.ipfs_hash,
        status: statusValue,
        registration_date: Math.floor(Date.now() / 1000),
      },
    ])
    .select();

  if (error) {
    console.error("Error creating property:", error);
    throw error;
  }

  const savedProperty = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return savedProperty as StoredProperty;
}

export async function getPropertyByPropertyId(propertyId: string): Promise<StoredProperty | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("property_id", propertyId);

  if (error) {
    console.error("Error fetching property:", error);
    throw error;
  }

  // data is an array, return the first item if it exists
  const property = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return property as StoredProperty | null;
}

export async function getPropertiesByOwner(ownerAddress: string): Promise<StoredProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_address", ownerAddress.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching owner properties:", error);
    throw error;
  }

  return (data as StoredProperty[]) || [];
}

export async function updatePropertyStatus(
  propertyId: string,
  status: string | number
) {
  const statusValue = typeof status === "string" ? STATUS_MAP[status] || 0 : status;
  
  const { data, error } = await supabase
    .from("properties")
    .update({ status: statusValue, updated_at: new Date().toISOString() })
    .eq("property_id", propertyId)
    .select();

  if (error) {
    console.error("Error updating property status:", error);
    throw error;
  }

  const property = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return property as StoredProperty;
}

export async function recordPropertyTransfer(
  propertyId: string,
  fromAddress: string,
  toAddress: string,
  txHash: string,
  transferType: "sale" | "transfer" | "inheritance"
) {
  const { data, error } = await supabase
    .from("property_transfers")
    .insert([
      {
        property_id: propertyId,
        from_address: fromAddress.toLowerCase(),
        to_address: toAddress.toLowerCase(),
        tx_hash: txHash,
        transfer_type: transferType,
      },
    ])
    .select();

  if (error) {
    console.error("Error recording transfer:", error);
    throw error;
  }

  const transfer = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return transfer;
}

export async function getPropertyTransfers(propertyId: string) {
  const { data, error } = await supabase
    .from("property_transfers")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transfers:", error);
    throw error;
  }

  return data || [];
}
