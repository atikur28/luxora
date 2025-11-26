// app/api/affiliate/click/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Click from "@/lib/db/models/click.model";
import Affiliate from "@/lib/db/models/affiliate.model";
import User from "@/lib/db/models/user.model";

export async function POST(req: Request) {
  const body = await req.json();
  const { code, productId } = body || {};

  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  await connectToDatabase();

  // only track if affiliate code exists and is approved
  const aff = await Affiliate.findOne({ code });
  if (!aff || !aff.approved) return NextResponse.json({ ok: false, message: "affiliate not active" });

  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown");
  const ua = req.headers.get("user-agent") || "";

  await Click.create({ affiliateCode: code, productId: productId || null, ip, userAgent: ua });

  // increment user's affiliateClicks counter
  await User.findByIdAndUpdate(aff.userId, { $inc: { affiliateClicks: 1 } }).exec();

  return NextResponse.json({ ok: true });
}
