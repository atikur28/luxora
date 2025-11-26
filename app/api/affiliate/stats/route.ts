// app/api/affiliate/stats/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Click from "@/lib/db/models/click.model";
import Affiliate from "@/lib/db/models/affiliate.model";
import Earning from "@/lib/db/models/earning.model";
import { auth } from "@/auth";
import User from "@/lib/db/models/user.model";
import AffiliateLink from "@/lib/db/models/AffiliateLink";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const aff = await Affiliate.findOne({ userId: user._id });
  if (!aff) return NextResponse.json({ error: "affiliate not found" }, { status: 404 });

  const clicks = await Click.find({ affiliateCode: aff.code }).sort({ createdAt: -1 }).limit(100);
  const earnings = await Earning.find({ affiliateCode: aff.code }).sort({ createdAt: -1 }).limit(100);
  const totalClicks = await Click.countDocuments({ affiliateCode: aff.code });
  const agg = await Earning.aggregate([
    { $match: { affiliateCode: aff.code } },
    { $group: { _id: null, sum: { $sum: "$amount" } } },
  ]);
  const totalEarnings = agg?.[0]?.sum || 0;

  return NextResponse.json({ code: aff.code, approved: aff.approved, clicks, earnings, totalClicks, totalEarnings });
}
