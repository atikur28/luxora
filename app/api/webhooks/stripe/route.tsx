import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { sendPurchaseReceipt } from "@/emails";
import Order, { IOrder } from "@/lib/db/models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") || "";
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
  }

  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge;

    const orderId = charge.metadata?.orderId;
    if (!orderId)
      return new NextResponse("Bad Request: no orderId in metadata", {
        status: 400,
      });

    const order = (await Order.findById(orderId).populate(
      "user",
      "email"
    )) as IOrder & { user?: { email?: string } };
    if (!order)
      return new NextResponse("Bad Request: order not found", { status: 400 });

    const email =
      charge.billing_details?.email ?? order.user?.email ?? "unknown";

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: charge.id,
      status: "COMPLETED",
      email_address: email,
      pricePaid: (charge.amount / 100).toFixed(2),
    };

    await order.save();

    try {
      await sendPurchaseReceipt({ order });
      console.log("✅ Purchase receipt email sent");
    } catch (emailErr) {
      console.error("❌ Email sending error:", emailErr);
    }

    return NextResponse.json({
      message: "✅ Order updated to Paid successfully",
    });
  }

  return NextResponse.json({ received: true });
}
