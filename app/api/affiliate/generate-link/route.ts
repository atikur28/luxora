import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import AffiliateLink from "@/lib/db/models/AffiliateLink";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const body = await req.json();
    const { productId, userId } = body;

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "productId and userId required" },
        { status: 400 }
      );
    }

    // Check if a link already exists
    let link = await AffiliateLink.findOne({ product: productId, user: userId });
    if (link) {
      return NextResponse.json({
        link: `${process.env.NEXT_PUBLIC_APP_URL}/product/${productId}?ref=${link.code}`,
      });
    }

    // Generate unique code
    let code: string;
    let exists: boolean;
    do {
      code = Math.random().toString(36).substring(2, 10);
      exists = await AffiliateLink.findOne({ code });
    } while (exists);

    // Create new link
    link = await AffiliateLink.create({
      product: productId,
      user: userId,
      code,
    });

    return NextResponse.json({
      link: `${process.env.NEXT_PUBLIC_APP_URL}/product/${productId}?ref=${link.code}`,
    });
  } catch (err: any) {
    console.error("Generate Link API Error:", err);

    // Always return JSON on error
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
