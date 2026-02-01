import { NextRequest, NextResponse } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const metadata = formData.get("metadata") as string | null;

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return NextResponse.json(
        { error: "Pinata API keys not configured" },
        { status: 500 }
      );
    }

    // If file is provided, upload file
    if (file) {
      const pinataFormData = new FormData();
      pinataFormData.append("file", file);

      if (metadata) {
        pinataFormData.append(
          "pinataMetadata",
          JSON.stringify({ name: metadata })
        );
      }

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
          body: pinataFormData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return NextResponse.json(
          { error: `Pinata error: ${error}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // If JSON metadata is provided without file
    const jsonMetadata = formData.get("jsonData") as string | null;
    if (jsonMetadata) {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
          body: JSON.stringify({
            pinataContent: JSON.parse(jsonMetadata),
            pinataMetadata: {
              name: metadata || "property-metadata",
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return NextResponse.json(
          { error: `Pinata error: ${error}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "No file or metadata provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Pinata upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload to IPFS" },
      { status: 500 }
    );
  }
}
