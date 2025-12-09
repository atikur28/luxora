"use client";

import { useState } from "react";

interface Props {
  link: string;
  onClose: () => void;
}

export default function AffiliateLinkModal({ link, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-yellow-400 p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-4 text-black">Your Affiliate Link</h2>
        <input
          type="text"
          value={link}
          readOnly
          className="w-full border border-yellow-600 bg-yellow-100 p-2 rounded mb-4 text-black"
          aria-label="Affiliate link"
        />
        <div className="flex justify-between">
          <button
            onClick={copyToClipboard}
            className="bg-black text-white py-1 px-3 rounded"
            aria-label="Copy affiliate link"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={onClose}
            className="bg-black/10 text-black py-1 px-3 rounded"
            aria-label="Close affiliate modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
