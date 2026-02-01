import { NextRequest, NextResponse } from "next/server";
import {
  getPropertyByPropertyId,
  getPropertyTransfers,
  updatePropertyStatus,
} from "@/lib/supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get("history") === "true";

    const property = await getPropertyByPropertyId(propertyId);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (includeHistory) {
      const transfers = await getPropertyTransfers(propertyId);
      return NextResponse.json({ property, transfers });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Property detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status || !["active", "blocked", "pending_transfer"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const property = await updatePropertyStatus(propertyId, status);
    return NextResponse.json(property);
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
