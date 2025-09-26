/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { sendPurchaseReceipt } from "@/emails";
import Order, { IOrder } from "@/lib/db/models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    console.log("📌 Webhook API HIT হয়েছে");

    const rawBody = await req.text();

    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return new NextResponse("❌ Missing Stripe signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      if (!orderId) {
        console.error("❌ No orderId in metadata");
        return new NextResponse("No orderId in metadata", { status: 400 });
      }

      const order: (IOrder & { user?: { email?: string } }) | null =
        await Order.findById(orderId).populate("user", "email");

      if (!order) {
        console.error("❌ Order not found in DB");
        return new NextResponse("Order not found", { status: 400 });
      }

      const email =
        session.customer_details?.email || order.user?.email || "unknown";

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: session.payment_intent as string,
        status: "COMPLETED",
        email_address: email,
        pricePaid: ((session.amount_total ?? 0) / 100).toFixed(2),
      };

      await order.save();
      console.log("✅ Order saved in DB");

      try {
        await sendPurchaseReceipt({ order });
        console.log("✅ Purchase receipt email sent");
      } catch (emailErr: any) {
        console.error("❌ Email sending error:", emailErr.message);
      }
    } else {
      console.log("ℹ️ Ignored event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    return new NextResponse(`Webhook error: ${err.message}`, { status: 500 });
  }
}
