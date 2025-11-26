// app/api/affiliate/generate/route.ts
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import Affiliate from "@/lib/db/models/affiliate.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // if already has affiliate entry return it
  let aff = await Affiliate.findOne({ userId: user._id });
  if (!aff) {
    const code = `LX${nanoid(6)}`; // e.g. LXa1B2c
    aff = await Affiliate.create({ userId: user._id, code, approved: false });
    user.affiliateCode = code;
    user.affiliateRequest = false; // since you generated, treat as created — admin approve separately
    await user.save();
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const link = `${base}/product/${""}?ref=${aff.code}`; // product page can have ref in query — product page handler reads it
  return NextResponse.json({ code: aff.code, link, approved: aff.approved });
}
