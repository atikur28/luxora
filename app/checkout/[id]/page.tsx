import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import PaymentForm from "./payment-form";

export const metadata = {
  title: "Payment",
};

const CheckoutPaymentPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  let client_secret: string | null = null;
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "USD",
      metadata: { orderId: order._id },
    });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <PaymentForm
      order={order}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      clientSecret={client_secret}
      isAdmin={session?.user?.role === "Admin" || false}
    />
  );
};

export default CheckoutPaymentPage;
