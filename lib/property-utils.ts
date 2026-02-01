import { supabase } from "./supabase-client";

/**
 * Generate a unique alphanumeric property ID like PROP001, PROP002, etc.
 */
export async function generatePropertyId(): Promise<string> {
  try {
    // Get the count of existing properties
    const { count, error } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error getting property count:", error);
      // Fallback to timestamp-based ID
      return `PROP${Math.floor(Math.random() * 1000000)}`;
    }

    const nextId = (count || 0) + 1;
    return `PROP${String(nextId).padStart(6, "0")}`;
  } catch (error) {
    console.error("Error generating property ID:", error);
    return `PROP${Math.floor(Math.random() * 1000000)}`;
  }
}

/**
 * Save property to Supabase database
 */
export async function savePropertyToDatabase(propertyData: {
  property_id: string;
  owner_address: string;
  owner_name: string;
  location: string;
  area: number;
  property_type: string;
  survey_number: string;
  description: string;
  ipfs_hash: string;
}) {
  try {
    const { data, error } = await supabase
      .from("properties")
      .insert([
        {
          property_id: propertyData.property_id,
          owner_address: propertyData.owner_address.toLowerCase(),
          owner_name: propertyData.owner_name,
          location: propertyData.location,
          area: propertyData.area,
          property_type: propertyData.property_type,
          survey_number: propertyData.survey_number,
          description: propertyData.description,
          ipfs_hash: propertyData.ipfs_hash,
          status: "active",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving property to database:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to save property to database:", error);
    throw error;
  }
}
