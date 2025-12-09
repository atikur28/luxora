import { NextRequest, NextResponse } from "next/server";
import { bkash } from "@/lib/bkash";

/**
 * POST /api/bkash/send-otp
 * Send OTP to customer phone
 */
export async function POST(request: NextRequest) {
  try {
    const { customerPhone } = await request.json();

    if (!customerPhone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Send OTP via bKash
    try {
      const result = await bkash.sendOTP(customerPhone);

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        customerMsisdn: result.customerMsisdn,
        mockOtp: result.mockOtp, // Only present in mock mode for testing
      });
    } catch (bkashError: unknown) {
      const bkashMsg = bkashError instanceof Error ? bkashError.message : "Failed to send OTP";
      console.error("bKash sendOTP error:", bkashMsg);

      // In development, fallback to mock OTP if network error
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev && (bkashMsg.includes("ENOTFOUND") || bkashMsg.includes("fetch failed") || bkashMsg.includes("network"))) {
        console.warn("bKash API unreachable in dev mode — returning mock OTP");
        const mockOtp = "123456";
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully (dev fallback)",
          customerMsisdn: customerPhone,
          mockOtp: mockOtp,
          note: "dev-fallback",
        });
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
    console.error("bKash send OTP error:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to send OTP";

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


