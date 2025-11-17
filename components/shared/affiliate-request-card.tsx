"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RocketIcon } from "lucide-react";
import { useState } from "react";

export default function AffiliateRequestCard({
  userEmail,
}: {
  userEmail: string;
}) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequested(true);
      } else {
        console.log(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-10 md:col-span-3">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Section */}
          <div className="flex items-start gap-4">
            <RocketIcon className="w-12 h-12 text-primary shrink-0" />
            <div>
              <h2 className="text-xl font-bold">
                Become an Affiliate Marketer
              </h2>
              <p className="text-muted-foreground mt-1">
                Earn commissions by promoting LuxOra products. Apply now and
                start your affiliate journey.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleRequest}
            disabled={loading || requested}
            className="w-full md:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requested ? "Request Sent" : loading ? "Requesting..." : "Request"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
