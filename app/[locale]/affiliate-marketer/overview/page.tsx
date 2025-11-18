import { auth } from "@/auth";
import { Metadata } from "next";
import OverviewReport from "./overview-report";

export const metadata: Metadata = {
  title: "Affiliate Dashboard",
};

const DashboardPage = async () => {
  const session = await auth();
  if (session?.user.role !== "Affiliater")
    throw new Error("Affiliater permission required");

  return <OverviewReport />;
};

export default DashboardPage;
