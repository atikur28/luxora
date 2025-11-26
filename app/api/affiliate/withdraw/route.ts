// app/api/affiliate/withdraw/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Withdrawal from "@/lib/db/models/withdrawal.model";
import { auth } from "@/auth";
import User from "@/lib/db/models/user.model";
import Affiliate from "@/lib/db/models/affiliate.model";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { amount, method, account } = body || {};
  if (!amount || !method) return NextResponse.json({ error: "missing" }, { status: 400 });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const aff = await Affiliate.findOne({ userId: user._id });
  if (!aff) return NextResponse.json({ error: "affiliate not found" }, { status: 404 });

  // basic balance check
  if ((user.wallet || 0) < amount) return NextResponse.json({ error: "insufficient balance" }, { status: 400 });

  const w = await Withdrawal.create({
    affiliateCode: aff.code,
    userId: user._id,
    amount,
    method,
    account,
    status: "pending",
  });

  // optionally deduct wallet now or on admin approve — here we deduct immediately and keep negative risk minimal
  user.wallet = (user.wallet || 0) - amount;
  await user.save();

  return NextResponse.json({ ok: true, withdrawal: w });
}
