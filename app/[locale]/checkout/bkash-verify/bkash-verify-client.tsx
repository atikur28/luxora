"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

export default function BkashVerifyClient({
  paymentID,
}: {
  paymentID: string;
  status?: string;
}) {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<{ success?: boolean; message?: string; orderId?: string; paymentID?: string; status?: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Query payment status
        const response = await axios.get(
          `/api/bkash/callback?paymentID=${paymentID}`
        );

        // Backend returns `{ success: boolean, status?: string, message?: string }`
        const ok = response.data?.success;
        const status = response.data?.status || response.data?.paymentStatus;

        if (!ok) {
          setError(response.data?.message || "Payment verification failed");
          return;
        }

        if (status === "Completed") {
          setResult({
            success: true,
            message: "Payment successful!",
            paymentID,
          });
          // Redirect to order page after 2 seconds
          setTimeout(() => {
            router.push(`/account/orders`);
          }, 2000);
        } else if (status === "Failed" || status === "Cancelled") {
          setError(`Payment ${String(status).toLowerCase()}. Please try again.`);
        } else {
          setError(`Payment status: ${String(status)}. Please contact support.`);
        }
      } catch (err: unknown) {
        console.error("Verification error:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to verify payment. Please contact support.";
        setError(errorMsg);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [paymentID, router]);

  if (verifying) {
    return (
      <div className="max-w-4xl w-full mx-auto space-y-8 py-10">
        <div className="flex flex-col gap-6 items-center">
          <Loader className="animate-spin w-8 h-8" />
          <h1 className="font-bold text-2xl lg:text-3xl">
            Verifying Payment
          </h1>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl w-full mx-auto space-y-8 py-10">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="font-bold text-2xl lg:text-3xl text-red-600">
            Payment Error
          </h1>
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/checkout">Return to Checkout</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="max-w-4xl w-full mx-auto space-y-8 py-10">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="font-bold text-2xl lg:text-3xl text-green-600">
            ✓ Payment Successful!
          </h1>
          <div className="text-center">
            <p className="text-gray-600 mb-2">{result.message}</p>
            <p className="text-sm text-gray-500">Payment ID: {result.paymentID}</p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to your orders...
            </p>
          </div>
          <Button asChild>
            <Link href="/account/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
