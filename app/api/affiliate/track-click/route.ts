import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AffiliateClick from "@/lib/db/models/affiliate-click.model";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { productId, affiliateUserId } = await request.json();

    if (!productId || !affiliateUserId) {
      return NextResponse.json(
        { error: "Missing productId or affiliateUserId" },
        { status: 400 }
      );
    }

    // Get user's IP address
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Log the click
    const click = await AffiliateClick.create({
      affiliateUserId,
      productId,
      ipAddress: ip,
      clickedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Click tracked", clickId: click._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const productId = request.nextUrl.searchParams.get("productId");
    const affiliateUserId = request.nextUrl.searchParams.get("affiliateUserId");

    const query: { productId?: string; affiliateUserId?: string } = {};

    if (productId) query.productId = productId;
    if (affiliateUserId) query.affiliateUserId = affiliateUserId;

    const clicks = await AffiliateClick.find(query).sort({ clickedAt: -1 });

    return NextResponse.json({ clicks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching clicks:", error);
    return NextResponse.json(
      { error: "Failed to fetch clicks" },
      { status: 500 }
    );
  }
}
