import { auth } from "@/auth";
import AffiliateRequestCard from "@/components/shared/affiliate-request-card";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Card, CardContent } from "@/components/ui/card";
import { Home, PackageCheckIcon, RocketIcon, User } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const PAGE_TITLE = "Your Account";
export const metadata: Metadata = {
  title: PAGE_TITLE,
};
export default async function AccountPage() {
  type ExtendedUser = {
    role: string;
    email: string;
    affiliateRequest: boolean;
  };
  const session = await auth();

  const user = session?.user as ExtendedUser;
  console.log(user);

  return (
    <div>
      <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>
      <div className="grid md:grid-cols-3 gap-4 items-stretch">
        <Card>
          <Link href="/account/orders">
            <CardContent className="flex items-start gap-4 p-6">
              <div>
                <PackageCheckIcon className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Orders</h2>
                <p className="text-muted-foreground">
                  Track, return, cancel an order, download invoice or buy again
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href="/account/manage">
            <CardContent className="flex items-start gap-4 p-6">
              <div>
                <User className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Login & security</h2>
                <p className="text-muted-foreground">
                  Manage password, email and mobile number
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href="/account/addresses">
            <CardContent className="flex items-start gap-4 p-6">
              <div>
                <Home className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Addresses</h2>
                <p className="text-muted-foreground">
                  Edit, remove or set default address
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Affiliate Request Card */}
      {user.role !== "Admin" &&
        user.affiliateRequest === false &&
        user.email && <AffiliateRequestCard userEmail={user.email} />}

      {/* Case 1: Pending affiliate request */}
      {user.role === "User" && user.affiliateRequest && (
        <Card className="mt-10 md:col-span-3 bg-primary/10">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <RocketIcon className="w-12 h-12 text-primary shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-primary">
                  Your Affiliate Request is Pending
                </h2>
                <p className="text-primary/80 mt-1">
                  We’ve received your request to become an Affiliate Marketer.
                  Please wait while our team reviews your application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Case 2: Already an Affiliater */}
      {user.role === "Affiliater" && user.affiliateRequest && (
        <Card className="mt-10 md:col-span-3 bg-primary/10">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <RocketIcon className="w-12 h-12 text-primary shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-primary">
                  You’re an Affiliate Marketer!
                </h2>
                <p className="text-primary/80 mt-1">
                  Keep promoting LuxOra products, grow your network, and earn
                  more commission every day. Your journey to success starts
                  here!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <BrowsingHistoryList className="mt-16" />
    </div>
  );
}
