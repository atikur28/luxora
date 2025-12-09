import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import { connectToDatabase } from "@/lib/db";
import AffiliateEarning from "@/lib/db/models/affiliate-earning.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage(props: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ payment_intent: string; affiliate?: string }>;
}) {
  const params = await props.params;

  const { id } = params;

  const searchParams = await props.searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();

  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  );
  if (
    paymentIntent.metadata.orderId == null ||
    paymentIntent.metadata.orderId !== order._id.toString()
  )
    return notFound();

  const isSuccess = paymentIntent.status === "succeeded";
  if (!isSuccess) return redirect(`/checkout/${id}`);

  // Record affiliate earnings if order was placed through affiliate link
  const affiliateUserId = searchParams.affiliate;
  if (affiliateUserId && isSuccess) {
    try {
      await connectToDatabase();

      // Check if earning already exists for this order
      const existingEarning = await AffiliateEarning.findOne({
        orderId: id,
      });

      if (!existingEarning) {
          // Commission rules per category
        const getCommissionPercent = (category?: string) => {
          if (!category) return 10;
          const c = category.toLowerCase();
          if (c.includes("shoe")) return 5; // shoes 5%
          if (c.includes("jean") || c.includes("pant")) return 7; // jeans/pants 7%
          if (c.includes("watch") || c.includes("watches")) return 10; // watches 10%
          return 10; // default 10%
        };

        // Process each item in the order
        for (const item of order.items) {
          const percent = getCommissionPercent(item.category);
          const commissionAmount = Math.round((item.price * item.quantity * percent) / 100 * 100) / 100;

          await AffiliateEarning.create({
            affiliateUserId,
            orderId: id,
            productId: item.product,
            orderAmount: item.price * item.quantity,
            commissionPercent: percent,
            commissionAmount,
            status: "confirmed",
          });
        }
      }
    } catch (error) {
      console.error("Error recording affiliate earning:", error);
    }
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center ">
        <h1 className="font-bold text-2xl lg:text-3xl">
          Thanks for your purchase
        </h1>
        <div>We are now processing your order.</div>
        <Button asChild>
          <Link href={`/account/orders/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  );
}
