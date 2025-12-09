
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateParamStorer() {
  const searchParams = useSearchParams();
  const affiliateUserId = searchParams.get("affiliate");

  useEffect(() => {
    if (affiliateUserId) {
      localStorage.setItem("affiliateUserId", affiliateUserId);
    }
  }, [affiliateUserId]);

  return null;
}
