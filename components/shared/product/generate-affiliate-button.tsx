"use client";

import { useState } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import AffiliateLinkModal from "../AffiliateLinkModal";

export default function GenerateAffiliateButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const [affiliateLink, setAffiliateLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();

  const isAffiliate = Boolean(
    session?.user?.affiliateRequest === true ||
      (session?.user?.role &&
        ["affiliate", "affiliater"].includes(session.user.role.toLowerCase()))
  );

  const generate = async () => {
    try {
      setError("");
      if (!session?.user?.id) {
        signIn();
        return;
      }
      setLoading(true);
      const res = await axios.post("/api/affiliate-request/affiliate/generate-link", {
        productId,
        userId: session.user.id,
      });
      setAffiliateLink(res.data.link);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to generate affiliate link:", err);
      setError("Failed to generate affiliate link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAffiliate) return null;

  return (
    <div className={className}>
      <button
        onClick={generate}
        className="w-full bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-4 rounded font-semibold transition"
        disabled={loading}
        aria-label="Generate affiliate link"
      >
        {loading ? "Generating..." : "Generate Affiliate Link"}
      </button>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      {showModal && (
        <AffiliateLinkModal
          link={affiliateLink}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
