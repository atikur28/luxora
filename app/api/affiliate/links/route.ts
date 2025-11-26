// app/api/affiliate/generate-link/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import AffiliateLink from "@/lib/db/models/AffiliateLink";

export async function POST(req: Request) {
  try {
    await connectToDB(); // Connect to MongoDB
    const body = await req.json();
    const { productId, userId } = body;

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "productId and userId required" },
        { status: 400 }
      );
    }

    // Check existing link
    let link = await AffiliateLink.findOne({ product: productId, user: userId });
    if (!link) {
      link = await AffiliateLink.create({
        product: productId,
        user: userId,
        code: Math.random().toString(36).substring(2, 10), // random code
      });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error("NEXT_PUBLIC_APP_URL not defined");
    }

    return NextResponse.json({
      link: `${process.env.NEXT_PUBLIC_APP_URL}/product/${productId}?ref=${link.code}`,
    });
  } catch (err: any) {
    console.error("Affiliate link generation error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
