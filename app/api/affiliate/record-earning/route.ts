import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AffiliateEarning from "@/lib/db/models/affiliate-earning.model";
import Product from "@/lib/db/models/product.model";
import Order from "@/lib/db/models/order.model";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { orderId, affiliateUserId } = await request.json();

    if (!orderId || !affiliateUserId) {
      return NextResponse.json(
        { error: "Missing orderId or affiliateUserId" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if earning already exists for this order
    const existingEarning = await AffiliateEarning.findOne({
      orderId: orderId,
    });
    if (existingEarning) {
      return NextResponse.json(
        { error: "Earning already recorded for this order" },
        { status: 400 }
      );
    }

    // Commission rules per category
    const getCommissionPercent = (category?: string) => {
      if (!category) return 10;
      const c = category.toLowerCase();
      if (c.includes("shoe")) return 5; // shoes 5%
      if (c.includes("jean") || c.includes("pant")) return 7; // jeans/pants 7%
      if (c.includes("watch") || c.includes("watches")) return 10; // watches 10%
      return 10; // default 10%
    };

    // Process each item in the order
    const earnings = [];
    for (const item of order.items) {
      const percent = getCommissionPercent(item.category);
      const commissionAmount = Math.round((item.price * item.quantity * percent) / 100 * 100) / 100;

      const earning = await AffiliateEarning.create({
        affiliateUserId,
        orderId: orderId,
        productId: item.product,
        orderAmount: item.price * item.quantity,
        commissionPercent: percent,
        commissionAmount,
        status: "confirmed",
      });

      earnings.push(earning);
    }

    return NextResponse.json(
      { success: true, message: "Earnings recorded", earnings },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording earning:", error);
    return NextResponse.json(
      { error: "Failed to record earning" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const affiliateUserId = request.nextUrl.searchParams.get("affiliateUserId");
    const status = request.nextUrl.searchParams.get("status");

    const query: { affiliateUserId?: string; status?: string } = {};

    if (affiliateUserId) query.affiliateUserId = affiliateUserId;
    if (status) query.status = status;

    let earnings = await AffiliateEarning.find(query).sort({ createdAt: -1 }).lean();

    // Try to enrich each earning with product info. `productId` is stored as string,
    // so populate may not work. Fetch product docs where possible to include name/slug/image.
    const enriched = await Promise.all(
      earnings.map(async (e) => {
        try {
          const pid = e.productId;
          // if productId already an object with name, keep it
          if (pid && typeof pid === "object" && "name" in pid) return e;
          // Attempt to find product by id
          const prod = await Product.findById(pid).select("name slug image").lean();
          if (prod) {
            return { ...e, productId: prod };
          }
        } catch (err) {
          // ignore lookup errors and keep original productId
          console.warn("Failed to enrich product for earning", e._id, err);
        }
        return e;
      })
    );
    earnings = enriched as typeof earnings;

    // Calculate total earnings
    const totalEarnings = earnings.reduce((sum, e) => sum + e.commissionAmount, 0);

    // Count unique orders for conversion metric
    const uniqueOrderIds = new Set<string>();
    earnings.forEach((e) => uniqueOrderIds.add(String(e.orderId)));

    return NextResponse.json(
      { earnings, totalEarnings, count: earnings.length, uniqueOrders: uniqueOrderIds.size },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
