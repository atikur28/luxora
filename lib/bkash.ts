// bKash API integration for Bangladesh mobile payments
// Sandbox: https://checkout.sandbox.bkash.com
// Live: https://checkout.bkash.com

const BASE_URL = process.env.BKASH_API_URL || "https://sandbox.bkashapi.com";
const BKASH_APP_KEY = process.env.BKASH_APP_KEY || "";
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET || "";
const BKASH_CALLBACK_URL =
  process.env.BKASH_CALLBACK_URL || "http://localhost:4007/api/bkash/callback";
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_BKASH === "true"; // Enable mock mode for testing

let tokenCache = {
  token: "",
  refreshToken: "",
  expiresAt: 0,
};

async function getToken() {
  // Return cached token if still valid
  if (tokenCache.token && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  // Mock mode: return a fake token for local testing
  if (MOCK_MODE) {
    tokenCache = {
      token: "mock_token_" + Math.random().toString(36).substr(2, 9),
      refreshToken: "mock_refresh_token",
      expiresAt: Date.now() + 55 * 60 * 1000,
    };
    console.log("[bKash Mock] Token generated");
    return tokenCache.token;
  }

  const response = await fetch(`${BASE_URL}/v1.2.0/tokenized/checkout/token/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`bKash token error: ${data.statusMessage || "Unknown error"}`);
  }

  // Cache token for 55 minutes (expires in 1 hour)
  tokenCache = {
    token: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  return data.id_token;
}

export const bkash = {
  /**
   * Create a payment request with bKash
   */
  createPayment: async function (orderId: string, amount: number, customerPhone: string) {
    const token = await getToken();

    // Mock mode: return a mock payment ID and redirect URL
    if (MOCK_MODE) {
      // For mock mode, pass orderId directly in the URL as a query parameter (it's safe via URL encoding)
      const paymentID = "mock_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      const mockCheckoutUrl = `${BKASH_CALLBACK_URL}?paymentID=${paymentID}&orderId=${encodeURIComponent(orderId)}&status=Completed`;
      console.log(`[bKash Mock] Payment created: ${paymentID}, orderId: ${orderId}`);
      return {
        paymentID,
        bkashURL: mockCheckoutUrl,
      };
    }

    const response = await fetch(
      `${BASE_URL}/v1.2.0/tokenized/checkout/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": BKASH_APP_KEY,
        },
        body: JSON.stringify({
          mode: "0011", // 0011 = tokenized checkout
          paymentType: "Checkout",
          amount: Math.round(amount * 100) / 100, // Ensure 2 decimal places
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: orderId,
          desc: `Order #${orderId}`,
          customerMsisdn: customerPhone.replace(/\D/g, ""), // Remove non-digits
          callbackURL: BKASH_CALLBACK_URL,
        }),
      }
    );

    const data = await response.json();
    if (data.statusCode !== "0000") {
      throw new Error(`bKash create payment error: ${data.statusMessage || "Unknown error"}`);
    }

    return {
      paymentID: data.paymentID,
      bkashURL: data.bkashURL,
    };
  },

  /**
   * Execute payment after user approves on bKash
   */
  executePayment: async function (paymentID: string) {
    const token = await getToken();

    const response = await fetch(
      `${BASE_URL}/v1.2.0/tokenized/checkout/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": BKASH_APP_KEY,
        },
        body: JSON.stringify({
          paymentID: paymentID,
        }),
      }
    );

    const data = await response.json();
    if (data.statusCode !== "0000") {
      throw new Error(`bKash execute payment error: ${data.statusMessage || "Unknown error"}`);
    }

    return {
      paymentID: data.paymentID,
      trxID: data.trxID, // Transaction ID from bKash
      amount: data.amount,
      status: data.transactionStatus, // "Completed" for successful payments
      customerNumber: data.customerMsisdn,
      completedTime: data.completedTime,
    };
  },

  /**
   * Query payment status
   */
  queryPayment: async function (paymentID: string, orderId?: string) {
    const token = await getToken();

    // Mock mode: return a successful payment status
    if (MOCK_MODE) {
      // In mock mode, orderId is passed as a parameter
      const mockOrderId = orderId || "unknown_order";
      console.log(`[bKash Mock] Querying payment status - paymentID: ${paymentID}, orderId: ${mockOrderId}`);
      return {
        statusCode: "0000",
        statusMessage: "Successful",
        paymentID: paymentID,
        transactionStatus: "Completed",
        trxID: "mock_trx_" + Math.random().toString(36).substr(2, 9),
        merchantInvoiceNumber: mockOrderId,
        amount: 100,
        customerMsisdn: "01712345678",
        completedTime: new Date().toISOString(),
      };
    }

    const response = await fetch(
      `${BASE_URL}/v1.2.0/tokenized/checkout/payment/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": BKASH_APP_KEY,
        },
        body: JSON.stringify({
          paymentID: paymentID,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`bKash query error: ${data.statusMessage || "Unknown error"}`);
    }

    return data;
  },

  /**
   * Refund a payment
   */
  refundPayment: async function (trxID: string, amount: number, reason: string) {
    const token = await getToken();

    const response = await fetch(
      `${BASE_URL}/v1.2.0/tokenized/checkout/payment/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": BKASH_APP_KEY,
        },
        body: JSON.stringify({
          trxID: trxID,
          amount: Math.round(amount * 100) / 100,
          reason: reason,
        }),
      }
    );

    const data = await response.json();
    if (data.statusCode !== "0000") {
      throw new Error(`bKash refund error: ${data.statusMessage || "Unknown error"}`);
    }

    return data;
  },

  /**
   * Send OTP to customer phone for payment verification
   */
  sendOTP: async function (customerPhone: string) {
    const token = await getToken();

    // Mock mode: return a mock OTP
    if (MOCK_MODE) {
      const mockOtp = "123456"; // Fixed OTP for testing in mock mode
      console.log(`[bKash Mock] OTP sent to ${customerPhone}: ${mockOtp}`);
      return {
        statusCode: "0000",
        statusMessage: "OTP sent successfully",
        customerMsisdn: customerPhone,
        mockOtp: mockOtp, // Only in mock mode for testing
      };
    }

    const response = await fetch(
      `${BASE_URL}/v1.2.0/tokenized/checkout/send/otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": BKASH_APP_KEY,
        },
        body: JSON.stringify({
          customerMsisdn: customerPhone.replace(/\D/g, ""), // Remove non-digits
        }),
      }
    );

    const data = await response.json();
    if (data.statusCode !== "0000") {
      throw new Error(`bKash send OTP error: ${data.statusMessage || "Unknown error"}`);
    }

    return data;
  },

  /**
   * Verify OTP sent to customer
   */
  verifyOTP: async function (customerPhone: string, otp: string) {
    const token = await getToken();

    // Mock mode: accept the fixed OTP 123456
    if (MOCK_MODE) {
      if (otp === "123456") {
        console.log(`[bKash Mock] OTP verified for ${customerPhone}`);
        return {
          statusCode: "0000",
          statusMessage: "OTP verified successfully",
          customerMsisdn: customerPhone,
        };
      } else {
        throw new Error("Invalid OTP. Use 123456 for testing.");
      }
    }

    const response = await fetch(
      `${BASE_URL}/v1.2.0/tokenized/checkout/verify/otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": BKASH_APP_KEY,
        },
        body: JSON.stringify({
          customerMsisdn: customerPhone.replace(/\D/g, ""), // Remove non-digits
          otp: otp,
        }),
      }
    );

    const data = await response.json();
    if (data.statusCode !== "0000") {
      throw new Error(`bKash verify OTP error: ${data.statusMessage || "Unknown error"}`);
    }

    return data;
  },
};
