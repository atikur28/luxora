import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Product from "@/lib/db/models/product.model"; // ✔ correct path

export async function GET() {
  try {
    await connectToDB();

    const products = await Product.find({}).lean();

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
