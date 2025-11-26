"use client";

import { useState } from "react";

interface Props {
  productId: string;
  userId?: string;
}

export default function AffiliateButton({ productId, userId }: Props) {
  const [affiliateLink, setAffiliateLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAffiliateLink = async () => {
    if (!userId) return alert("Login to generate affiliate link");

    setLoading(true);
    try {
      // Generate new link
      const createRes = await fetch("/api/affiliate/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId }),
      });

      const text = await createRes.text();
      if (!createRes.ok) {
        console.error("Server response:", text);
        throw new Error(text || "Failed to generate link");
      }

      const json = JSON.parse(text);
      if (!json.link) throw new Error("Invalid response from server");

      setAffiliateLink(json.link);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to generate affiliate link: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!affiliateLink) return;
    navigator.clipboard.writeText(affiliateLink);
    alert("Affiliate link copied!");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={generateAffiliateLink}
        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 w-full"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Affiliate Link"}
      </button>

      {affiliateLink && (
        <div className="mt-2 p-2 bg-gray-100 rounded flex flex-col gap-2">
          <input
            type="text"
            readOnly
            value={affiliateLink}
            className="w-full border p-1 rounded"
            onFocus={(e) => e.target.select()}
          />
          <button
            className="bg-purple-700 text-white px-2 py-1 rounded hover:bg-purple-800"
            onClick={copyLink}
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
