import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/db/models/order.model";
import { bkash } from "@/lib/bkash";
import Setting from "@/lib/db/models/setting.model";

/**
 * POST /api/bkash/create-payment
 * Create a payment request with bKash
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, customerPhone, currency } = await request.json();

    if (!orderId || !amount || !customerPhone) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate order exists
    await connectToDatabase();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Determine currency and convert to BDT only when needed
    await connectToDatabase();
    const setting = await Setting.findOne();
    const bdtCurrency = setting?.availableCurrencies?.find((c: { code: string }) => c.code === "BDT");
    const convertRate = bdtCurrency?.convertRate || 110; // fallback to 110 if not configured

    let amountInBDT: number;
    // If the client explicitly sent currency as BDT, treat `amount` as BDT already
    if (currency && String(currency).toUpperCase() === "BDT") {
      amountInBDT = Math.round(Number(amount) * 100) / 100;
    } else {
      amountInBDT = Math.round(Number(amount) * convertRate * 100) / 100;
    }

    // Create payment with bKash (amount must be in BDT)
    let payment;
    try {
      payment = await bkash.createPayment(orderId, amountInBDT, customerPhone);
    } catch (err: unknown) {
      console.error("bKash create payment error (network):", err);
      const errMsg = err instanceof Error ? err.message : "Failed to create payment";

      // If we're in development, fallback to a mock payment so local testing continues
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev && (String(errMsg).includes("ENOTFOUND") || String(errMsg).includes("fetch failed") || String(errMsg).includes("network"))) {
          console.warn("bKash API unreachable — falling back to mock payment for local development.");
          const paymentID = "mock_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          const callbackUrl = process.env.BKASH_CALLBACK_URL || "http://localhost:4007/api/bkash/callback";
          const mockCheckoutUrl = `${callbackUrl}?paymentID=${paymentID}&orderId=${encodeURIComponent(orderId)}&status=Completed`;

          return NextResponse.json({
            success: true,
            paymentID,
            bkashURL: mockCheckoutUrl,
            amount: amount,
            currency: currency || "USD",
            amountInBDT,
            note: "mock",
          });
        }

      // Production or other errors: return an appropriate error response
      if (String(errMsg).includes("ENOTFOUND") || String(errMsg).includes("fetch failed")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Network error connecting to bKash API. Check `BKASH_API_URL`, your network/DNS, or enable `NEXT_PUBLIC_MOCK_BKASH=true` for local testing.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: false, message: errMsg }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paymentID: payment.paymentID,
      bkashURL: payment.bkashURL,
      amount: amount,
      currency: currency || "USD",
      amountInBDT,
    });
  } catch (error: unknown) {
    console.error("bKash create payment error:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to create payment";
    // In development return more detail to help debugging
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        {
          success: false,
          message: errorMsg,
          debug: error instanceof Error ? { stack: error.stack } : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
