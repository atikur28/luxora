import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { sendPurchaseReceipt } from "@/emails";
import Order, { IOrder } from "@/lib/db/models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    console.log("📌 API HIT হয়েছে");

    const { paymentIntentId } = await req.json();

    console.log("➡️ paymentIntentId:", paymentIntentId);

    if (!paymentIntentId) {
      console.error("❌ paymentIntentId missing");
      return new NextResponse("Missing paymentIntentId", { status: 400 });
    }

    // Retrieve paymentIntent directly from Stripe (no webhook verification needed)
    const paymentIntent = (await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["charges.data.billing_details"],
      }
    )) as unknown as Stripe.PaymentIntent & {
      charges: Stripe.ApiList<Stripe.Charge>;
    };

    console.log("✅ paymentIntent retrieved:", paymentIntent?.id);

    const orderId = paymentIntent.metadata?.orderId;

    console.log("➡️ orderId from metadata:", orderId);

    if (!orderId) {
      console.error("❌ No orderId in metadata");
      return new NextResponse("No orderId in metadata", { status: 400 });
    }
    const order: (IOrder & { user?: { email?: string } }) | null =
      await Order.findById(orderId).populate("user", "email");

    console.log("➡️ Order found:", order?._id);

    if (!order) {
      console.error("❌ Order not found in DB");
      return new NextResponse("Order not found", { status: 400 });
    }

    const email =
      paymentIntent.receipt_email ||
      paymentIntent.charges?.data?.[0]?.billing_details?.email ||
      order.user?.email ||
      "unknown";
    console.log("➡️ Email to use:", email);

    // Mark the order as paid
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: paymentIntent.id,
      status: "COMPLETED",
      email_address: email,
      pricePaid: (paymentIntent.amount_received / 100).toFixed(2),
    };

    console.log("➡️ Order before save:", order);

    await order.save();
    console.log("✅ Order saved in DB");

    try {
      await sendPurchaseReceipt({ order });
      console.log("✅ Purchase receipt email sent");
    } catch (emailErr: unknown) {
      const err = emailErr as Error;
      console.error("❌ Email sending error:", err.message);
    }

    return NextResponse.json({
      message: "✅ Order updated to Paid successfully (no webhook)",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("❌ Payment processing failed:", error.message);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
