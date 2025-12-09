import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/db/models/product.model";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Ensure requester is authenticated and is an affiliate
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAffiliate =
      session.user.affiliateRequest === true ||
      (session.user.role && ["affiliate", "affiliater"].includes(session.user.role.toLowerCase()));

    if (!isAffiliate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Generate affiliate link using session user id
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4007";
    const affiliateLink = `${baseUrl}/product/${product.slug}?affiliate=${session.user.id}`;

    return NextResponse.json({ link: affiliateLink });
  } catch (error) {
    console.error("Error generating affiliate link:", error);
    return NextResponse.json(
      { error: "Failed to generate affiliate link" },
      { status: 500 }
    );
  }
}
