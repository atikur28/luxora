import { NextRequest, NextResponse } from "next/server";
import { bkash } from "@/lib/bkash";

/**
 * POST /api/bkash/verify-otp
 * Verify OTP entered by customer
 */
export async function POST(request: NextRequest) {
  try {
    const { customerPhone, otp } = await request.json();

    if (!customerPhone || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Verify OTP via bKash
    try {
      const result = await bkash.verifyOTP(customerPhone, otp);

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        customerMsisdn: result.customerMsisdn,
      });
    } catch (bkashError: unknown) {
      const bkashMsg = bkashError instanceof Error ? bkashError.message : "Failed to verify OTP";
      console.error("bKash verifyOTP error:", bkashMsg);

      // In development, allow any 6-digit OTP if network error
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev && (bkashMsg.includes("ENOTFOUND") || bkashMsg.includes("fetch failed") || bkashMsg.includes("network"))) {
        console.warn("bKash API unreachable in dev mode — accepting any 6-digit OTP");
        if (otp.length === 6 && /^\d+$/.test(otp)) {
          return NextResponse.json({
            success: true,
            message: "OTP verified successfully (dev fallback)",
            customerMsisdn: customerPhone,
            note: "dev-fallback",
          });
        } else {
          return NextResponse.json(
            { success: false, message: "Invalid OTP format. Use 6 digits." },
            { status: 400 }
          );
        }
      }

      // Return detailed error for dev mode
      if (isDev) {
        return NextResponse.json(
          {
            success: false,
            message: bkashMsg,
            debug: bkashError instanceof Error ? { stack: bkashError.stack } : undefined,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, message: bkashMsg },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("bKash verify OTP error:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to verify OTP";

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

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
