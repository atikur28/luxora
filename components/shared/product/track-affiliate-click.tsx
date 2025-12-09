
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface TrackAffiliateClickProps {
  productId: string;
}

export default function TrackAffiliateClick({ productId }: TrackAffiliateClickProps) {
  const searchParams = useSearchParams();
  const affiliateUserId = searchParams.get("affiliate");

  useEffect(() => {
    const trackClick = async () => {
      if (!affiliateUserId) return;

      try {
        const response = await fetch("/api/affiliate/track-click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            affiliateUserId,
          }),
        });

        if (!response.ok) {
          console.error("Failed to track affiliate click");
        }
      } catch (error) {
        console.error("Error tracking affiliate click:", error);
      }
    };

    trackClick();
  }, [productId, affiliateUserId]);

  return null;
}
