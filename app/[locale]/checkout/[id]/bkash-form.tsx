"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type FlowState = "phone" | "otp" | "payment";

export default function BkashForm({
  orderId,
  totalPrice,
  currency,
}: {
  orderId: string;
  totalPrice: number;
  currency?: string;
}) {
  const [flowState, setFlowState] = useState<FlowState>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [pendingBkashUrl, setPendingBkashUrl] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Step 1: Send OTP to phone
  const handleSendOtp = async () => {
    if (!customerPhone) {
      setError("Please enter your phone number");
      setDialogOpen(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/bkash/send-otp", {
        customerPhone,
      });

      if (response.data.success) {
        setFlowState("otp");
        // In mock mode, show hint
        if (response.data.mockOtp) {
          setError(`(Dev tip: Use OTP ${response.data.mockOtp} for testing)`);
        }
      } else {
        setError(response.data.message || "Failed to send OTP");
        setDialogOpen(true);
      }
    } catch (err: unknown) {
      console.error("Send OTP error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMsg);
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      setDialogOpen(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/bkash/verify-otp", {
        customerPhone,
        otp,
      });

      if (response.data.success) {
        setFlowState("payment");
        // Automatically proceed to payment after OTP verification
        handlePayment();
      } else {
        setError(response.data.message || "Failed to verify OTP");
        setDialogOpen(true);
      }
    } catch (err: unknown) {
      console.error("Verify OTP error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to verify OTP";
      setError(errorMsg);
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Create payment after OTP verified
  const handlePayment = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/bkash/create-payment", {
        orderId,
        amount: totalPrice,
        currency: currency || "USD",
        customerPhone,
      });

      if (response.data.success && response.data.bkashURL) {
        const amountInBDT = response.data.amountInBDT;
        const respCurrency = response.data.currency;
        const respAmount = response.data.amount;

        const format = (n: unknown) => {
          const num = typeof n === "number" ? n : Number(n);
          if (Number.isFinite(num)) return num.toLocaleString();
          return String(n ?? "");
        };

        let displayAmount = "";
        if (amountInBDT) displayAmount = `${format(amountInBDT)} BDT`;
        else if (respCurrency) displayAmount = `${format(respAmount)} ${respCurrency}`;
        else displayAmount = `${format(totalPrice)} USD`;

        // If backend indicates this is a mock (local dev) payment, show success first
        if (response.data.note && String(response.data.note).toLowerCase() === "mock") {
          setSuccessMessage(`Payment simulated: ${displayAmount}. Click OK to continue to confirmation.`);
          setPendingBkashUrl(response.data.bkashURL);
          setSuccessOpen(true);
        } else {
          // Use styled AlertDialog confirm instead of native confirm
          setConfirmMessage(`You will be redirected to bKash to pay ${displayAmount}. Continue?`);
          setPendingBkashUrl(response.data.bkashURL);
          setConfirmOpen(true);
        }
      } else {
        setError(response.data.message || "Failed to create payment");
        setDialogOpen(true);
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate payment";
      setError(errorMsg);
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setFlowState("phone");
    setOtp("");
    setError("");
  };

  return (
    <div className="space-y-4">
      {/* Phone Input Step */}
      {flowState === "phone" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              bKash Phone Number (01XXXXXXXXX)
            </label>
            <input
              type="tel"
              placeholder="01712345678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border p-2 rounded"
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Button
            className="w-full rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3"
            onClick={handleSendOtp}
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </>
      )}

      {/* OTP Input Step */}
      {flowState === "otp" && (
        <>
          <div className="bg-green-50 p-3 rounded text-sm text-green-800 mb-2">
            OTP sent to {customerPhone}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Enter OTP (6 digits)
            </label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              className="w-full border p-2 rounded text-center text-2xl tracking-widest"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          {error && (
            <div className={`text-sm ${error.includes("Dev tip") ? "text-blue-600" : "text-red-600"}`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              className="rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </>
      )}

      {/* Error dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={(open) => { if (!open) setError(""); setDialogOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Error</AlertDialogTitle>
            <AlertDialogDescription>
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDialogOpen(false); setError(""); }}>
              Close
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm redirect dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!open) { setConfirmMessage(""); setPendingBkashUrl(null); } setConfirmOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Proceed to bKash</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmOpen(false); setPendingBkashUrl(null); setConfirmMessage(""); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setConfirmOpen(false);
              if (pendingBkashUrl) window.location.href = pendingBkashUrl;
            }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success dialog (used for mock payments) */}
      <AlertDialog open={successOpen} onOpenChange={(open) => { if (!open) { setSuccessMessage(""); setPendingBkashUrl(null); } setSuccessOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Successful</AlertDialogTitle>
            <AlertDialogDescription>
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setSuccessOpen(false);
              if (pendingBkashUrl) window.location.href = pendingBkashUrl;
            }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info box */}
      {flowState === "phone" && (
        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
          <p className="font-semibold mb-2">How to pay with bKash:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your bKash registered phone number</li>
            <li>Click &quot;Send OTP&quot; to receive a verification code</li>
            <li>Enter the OTP and verify</li>
            <li>You will be redirected to bKash payment page</li>
            <li>Complete the payment on bKash</li>
            <li>You will be redirected back to confirm payment</li>
          </ol>
        </div>
      )}
    </div>
  );
}
