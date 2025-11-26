// components/affiliate/GenerateLinkPopup.tsx
"use client";
import React, { useState } from "react";

type Props = { onClose?: () => void };

export default function GenerateLinkPopup({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function createLink() {
    try {
      setLoading(true);
      const res = await fetch("/api/affiliate/generate", { method: "POST" });
      const j = await res.json();
      if (j?.link) {
        setLink(j.link);
        navigator.clipboard.writeText(j.link);
        alert("Link created and copied to clipboard");
      } else {
        alert("Failed to create link");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.4)" }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: 420 }}>
        <h3>Generate Affiliate Link</h3>
        <p>Click to create your unique affiliate link. It will be copied automatically.</p>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={createLink} disabled={loading} className="btn">
            {loading ? "Creating..." : "Generate Link"}
          </button>
          <button onClick={() => onClose?.()} className="btn-ghost">Close</button>
        </div>

        {link && (
          <div style={{ marginTop: 12 }}>
            <input readOnly value={link} style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => { navigator.clipboard.writeText(link || ""); alert("Copied"); }}>Copy Link</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
