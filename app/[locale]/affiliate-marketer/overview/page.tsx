// app/affiliate-marketer/overview/page.tsx
import { auth } from "@/auth"; // your auth helper
import { Metadata } from "next";
import AffiliateDashboardClient from "@/components/affiliate/AffiliateDashboardClient";


export const metadata: Metadata = {
  title: "Affiliate Dashboard",
};

const DashboardPage = async () => {
  const session = await auth();
  if (!session) throw new Error("Authentication required");
  if (session?.user?.role !== "Affiliater") throw new Error("Affiliater permission required");

  // Pass only the userId to the client
  const userId = session.user.id;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Affiliate Dashboard</h1>
      <AffiliateDashboardClient userId={userId} />
    </div>
  );
};

export default DashboardPage;
