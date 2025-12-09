import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AffiliateWithdraw from "@/lib/db/models/affiliate-withdraw.model";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { affiliateUserId, amount, paymentDetails } = await request.json();

    if (!affiliateUserId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid affiliateUserId or amount" },
        { status: 400 }
      );
    }

    // Create a withdraw request (status: pending)
    const req = await AffiliateWithdraw.create({
      affiliateUserId,
      amount,
      paymentDetails: paymentDetails || {},
      status: "pending",
    });

    return NextResponse.json({ success: true, request: req }, { status: 201 });
  } catch (error) {
    console.error("Error creating withdraw request", error);
    return NextResponse.json({ error: "Failed to create withdraw request" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const affiliateUserId = request.nextUrl.searchParams.get("affiliateUserId");

    if (!affiliateUserId) {
      return NextResponse.json({ error: "Missing affiliateUserId" }, { status: 400 });
    }

    const records = await AffiliateWithdraw.find({ affiliateUserId }).sort({ requestedAt: -1 });
    const totalWithdrawn = records.filter(r => r.status === "paid").reduce((s, r) => s + (r.amount || 0), 0);
    const pendingTotal = records.filter(r => r.status === "pending").reduce((s, r) => s + (r.amount || 0), 0);

    return NextResponse.json({ records, totalWithdrawn, pendingTotal }, { status: 200 });
  } catch (error) {
    console.error("Error fetching withdraws", error);
    return NextResponse.json({ error: "Failed to fetch withdraws" }, { status: 500 });
  }
}
