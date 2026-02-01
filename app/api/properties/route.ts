import { NextRequest, NextResponse } from "next/server";
import {
  createProperty,
  getPropertiesByOwner,
  getPropertyByPropertyId,
  StoredProperty,
} from "@/lib/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");

    if (propertyId) {
      // Get specific property by ID
      const property = await getPropertyByPropertyId(propertyId);
      if (!property) {
        return NextResponse.json(null);
      }
      return NextResponse.json(property);
    }

    if (owner) {
      // Get all properties owned by address
      const properties = await getPropertiesByOwner(owner);
      return NextResponse.json(properties);
    }

    if (status) {
      // Get properties by status (for disputes)
      const statusMap: Record<string, number> = {
        active: 0,
        pending_transfer: 2,
        blocked: 1,
      };
      const statusValue = statusMap[status] || -1;
      
      // For now, return empty array - full implementation would query by status
      // This is a placeholder for the dispute management feature
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
  } catch (error) {
    console.error("Properties API error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      property_id,
      owner_address,
      owner_name,
      location,
      area,
      property_type,
      survey_number,
      description,
      ipfs_hash,
    } = body;

    // Validate required fields
    if (
      !property_id ||
      !owner_address ||
      !location ||
      !property_type ||
      !ipfs_hash
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const property = await createProperty({
      property_id,
      owner_address: owner_address.toLowerCase(),
      owner_name: owner_name || "",
      location,
      area: parseFloat(area) || 0,
      property_type,
      survey_number: survey_number || "",
      description: description || "",
      ipfs_hash,
      status: "active",
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const body = await request.json();
    const { status } = body;

    if (!propertyId || status === undefined) {
      return NextResponse.json(
        { error: "Missing propertyId or status" },
        { status: 400 }
      );
    }

    // Update property status in database
    const { updatePropertyStatus } = await import("@/lib/supabase-client");
    const updated = await updatePropertyStatus(propertyId, status);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
