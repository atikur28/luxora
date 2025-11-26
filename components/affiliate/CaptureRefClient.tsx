// components/affiliate/CaptureRefClient.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function CaptureRefClient({ productId }: { productId?: string }) {
  const search = useSearchParams();
  const ref = search.get("ref");

  useEffect(() => {
    if (!ref) return;
    // set cookie to persist referral to checkout
    Cookies.set("ref", ref, { expires: 7 });

    // send click event
    (async () => {
      try {
        await fetch("/api/affiliate/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: ref, productId }),
        });
      } catch (err) {
        console.error("affiliate click error", err);
      }
    })();
  }, [ref, productId]);

  return null;
}
