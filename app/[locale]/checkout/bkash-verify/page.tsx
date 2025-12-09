import Link from "next/link";
import { Button } from "@/components/ui/button";
import BkashVerifyClient from "./bkash-verify-client";

export const metadata = {
  title: "bKash Payment",
};

export default async function BkashVerifyPage(props: {
  searchParams: Promise<{ paymentID?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const paymentID = searchParams.paymentID;
  const status = searchParams.status;

  if (!paymentID) {
    return (
      <div className="max-w-4xl w-full mx-auto space-y-8 py-10">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="font-bold text-2xl lg:text-3xl text-red-600">
            Payment Error
          </h1>
          <div className="text-center">
            <p>Invalid payment ID. Please try again.</p>
          </div>
          <Button asChild>
            <Link href="/checkout">Return to Checkout</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <BkashVerifyClient paymentID={paymentID} status={status} />;
}
