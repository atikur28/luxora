import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/db/models/product.model";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({ isPublished: true }).lean();

    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
