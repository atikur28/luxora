import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order, { type IOrder } from "@/lib/db/models/order.model";
import AffiliateEarning from "@/lib/db/models/affiliate-earning.model";
import { bkash } from "@/lib/bkash";
import { sendPurchaseReceipt } from "@/emails";

/**
 * GET /api/bkash/callback?paymentID=xxx
 * bKash redirects here after user completes/fails payment
 * Also used for polling payment status
 */
export async function GET(request: NextRequest) {
  try {
    const paymentID = request.nextUrl.searchParams.get("paymentID");
    const orderId = request.nextUrl.searchParams.get("orderId"); // For mock mode, orderId is passed in URL

    if (!paymentID) {
      return NextResponse.json(
        { success: false, message: "Missing paymentID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query payment status from bKash (pass orderId for mock mode)
    const paymentStatus = await bkash.queryPayment(paymentID, orderId || undefined);

    if (paymentStatus.statusCode !== "0000") {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    const transactionStatus = paymentStatus.transactionStatus;

    if (transactionStatus === "Completed") {
      // Find order by invoice number (we set this to orderId when creating payment)
      const orderIdFromPayment = paymentStatus.merchantInvoiceNumber;
      const order = await Order.findById(orderIdFromPayment).populate<{
        user: { email: string; name: string };
        items: unknown[];
      }>("user", "email name");

      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      if (order.isPaid) {
        // Already paid
        return NextResponse.json({
          success: true,
          message: "Order already paid",
          orderId: order._id,
          status: "Completed",
        });
      }

      // Mark order as paid
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentStatus.paymentID,
        status: "Completed",
        email_address: order.user?.email || "",
        pricePaid: paymentStatus.amount,
      };

      await order.save();

      // Send receipt email
      if (order.user?.email) {
        await sendPurchaseReceipt({ order: order as unknown as IOrder });
      }

      // Record affiliate earnings if order came through affiliate link
      // Get affiliateUserId from order data (should be stored during checkout)
      const affiliateUserId = (order as { affiliateUserId?: string }).affiliateUserId;
      if (affiliateUserId) {
        const getCommissionPercent = (category?: string) => {
          if (!category) return 10;
          const c = category.toLowerCase();
          if (c.includes("shoe")) return 5;
          if (c.includes("jean") || c.includes("pant")) return 7;
          if (c.includes("watch")) return 10;
          return 10;
        };

        for (const item of order.items as { category?: string; price: number; quantity: number; product: string }[]) {
          const percent = getCommissionPercent(item.category);
          const commissionAmount =
            Math.round(((item.price * item.quantity * percent) / 100) * 100) / 100;

          await AffiliateEarning.create({
            affiliateUserId,
            orderId: order._id,
            productId: item.product,
            orderAmount: item.price * item.quantity,
            commissionPercent: percent,
            commissionAmount,
            status: "confirmed",
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        orderId: order._id,
        status: "Completed",
      });
    } else if (transactionStatus === "Failed" || transactionStatus === "Cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment ${transactionStatus.toLowerCase()}`,
          status: transactionStatus,
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Unknown payment status: ${transactionStatus}`,
          status: transactionStatus,
        },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("bKash callback error:", error);
    const errorMsg = error instanceof Error ? error.message : "Callback processing failed";
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
