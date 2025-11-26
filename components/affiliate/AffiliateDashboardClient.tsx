// components/affiliate/AffiliateDashboardClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Product {
  _id: string;
  name: string;
  price: number;
  affiliateLink?: string; // added
}

interface AffiliateLink {
  _id: string;
  productId: Product | string;
  link: string;
  createdAt?: string;
}

const TopNav: React.FC = () => (
  <nav className="bg-white shadow rounded mb-6">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between h-12">
        <div className="flex items-center space-x-6">
          <div className="font-bold text-lg">LuxOra</div>
          <ul className="flex gap-3 text-sm text-gray-700">
            <li className="px-3 py-2 rounded bg-gray-100">Home</li>
            <li className="px-3 py-2 rounded hover:bg-gray-50">Product Linking</li>
            <li className="px-3 py-2 rounded hover:bg-gray-50">Amazon CPM Ads</li>
            <li className="px-3 py-2 rounded hover:bg-gray-50">Promotions</li>
            <li className="px-3 py-2 rounded hover:bg-gray-50">Tools</li>
            <li className="px-3 py-2 rounded hover:bg-gray-50">Reports</li>
            <li className="px-3 py-2 rounded hover:bg-gray-50">Help</li>
          </ul>
        </div>
        <div className="text-sm text-gray-500">Locale: United States • Store: luxora</div>
      </div>
    </div>
  </nav>
);

export default function AffiliateDashboardClient({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartDataPoints, setChartDataPoints] = useState<{ date: string; earnings: number; clicks: number }[]>([]);
  const [popupLink, setPopupLink] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Safe JSON parse helper
        const safeJson = async (res: Response) => {
          try {
            const text = await res.text();
            return text ? JSON.parse(text) : [];
          } catch (err) {
            console.error("JSON parse error:", err);
            return [];
          }
        };

        // Fetch products with affiliate links
        const res = await fetch(`/api/affiliate/links?userId=${encodeURIComponent(userId)}`);
        const data = await safeJson(res);
        setProducts(data || []);

        // Fetch chart data (mock or API)
        const rRes = await fetch(`/api/affiliate/report?userId=${encodeURIComponent(userId)}`);
        if (rRes.ok) {
          const rJson = await safeJson(rRes);
          setChartDataPoints(rJson?.data || generateMockChartData());
        } else {
          setChartDataPoints(generateMockChartData());
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        setProducts([]);
        setChartDataPoints(generateMockChartData());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  function generateMockChartData() {
    const out = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      out.push({
        date: d.toLocaleDateString(),
        earnings: Math.round(Math.random() * 30),
        clicks: Math.round(Math.random() * 150),
      });
    }
    return out;
  }

  const chartData = useMemo(() => {
    const labels = chartDataPoints.map((p) => p.date);
    return {
      labels,
      datasets: [
        {
          label: "Earnings ($)",
          data: chartDataPoints.map((p) => p.earnings),
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y",
        },
        {
          label: "Clicks",
          data: chartDataPoints.map((p) => p.clicks),
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y1",
        },
      ],
    };
  }, [chartDataPoints]);

  const chartOptions = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    stacked: false,
    plugins: { legend: { position: "top" as const } },
    scales: {
      y: { type: "linear" as const, position: "left" as const },
      y1: { type: "linear" as const, position: "right" as const, grid: { drawOnChartArea: false } },
    },
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      alert("Copied to clipboard!");
    } catch {
      alert("Copy failed");
    }
  };

  const summary = useMemo(() => {
    const totalEarnings = chartDataPoints.reduce((s, p) => s + p.earnings, 0);
    const totalClicks = chartDataPoints.reduce((s, p) => s + p.clicks, 0);
    const conversion = totalClicks ? ((products.length / totalClicks) * 100).toFixed(2) : "0.00";
    return {
      itemsShipped: Math.max(0, products.length * 2),
      totalEarnings: totalEarnings.toFixed(2),
      orderedItems: Math.max(0, products.length * 2),
      clicks: totalClicks,
      conversion,
    };
  }, [chartDataPoints, products]);

  if (loading) return <div className="p-4">Loading dashboard…</div>;

  return (
    <div>
      <TopNav />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          {/* Chart Card */}
          <div className="bg-white rounded shadow p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Earnings Overview (Last 14 Days)</h2>
              <div className="text-sm text-gray-500">Updated just now</div>
            </div>
            <div style={{ height: 320 }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Products list */}
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium">Products</h3>
              <div className="text-sm text-gray-500">{products.length} products</div>
            </div>

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="text-sm text-gray-500">No products found.</div>
              ) : (
                products.map((p) => (
                  <div key={p._id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">${p.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        onClick={() => setPopupLink(p.affiliateLink!)}
                      >
                        Show Affiliate Link
                      </button>
                      <a href={`/product/${p._id}`} className="text-sm text-gray-600 hover:underline">
                        View
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded shadow p-4">
            <h3 className="text-md font-medium mb-3">Summary for This Month</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Total Items Shipped:</span>
                <span className="font-medium">{summary.itemsShipped}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Earnings:</span>
                <span className="font-medium">${summary.totalEarnings}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Ordered Items:</span>
                <span className="font-medium">{summary.orderedItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Clicks:</span>
                <span className="font-medium">{summary.clicks}</span>
              </div>
              <div className="flex justify-between">
                <span>Conversion:</span>
                <span className="font-medium">{summary.conversion}%</span>
              </div>
            </div>
            <div className="mt-4 text-right">
              <a className="text-sm text-blue-600 hover:underline" href="/affiliate/report">
                View Full Report
              </a>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h3 className="text-md font-medium mb-3">Affiliate Links</h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {products.length === 0 ? (
                <div className="text-sm text-gray-500">No affiliate links</div>
              ) : (
                products.map((p) => (
                  <div key={p._id} className="flex items-start justify-between border rounded p-2">
                    <div className="text-sm break-all">{p.affiliateLink}</div>
                    <div className="flex flex-col items-end gap-2 ml-3">
                      <button
                        className="text-sm px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => copyLink(p.affiliateLink!)}
                      >
                        Copy
                      </button>
                      <small className="text-xs text-gray-400">{/* optional date */}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup for affiliate link */}
      {popupLink && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setPopupLink(null)}
        >
          <div className="bg-white p-6 rounded shadow-md w-80" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold mb-2">Your Affiliate Link</h4>
            <input
              type="text"
              readOnly
              value={popupLink}
              className="w-full border p-2 rounded mb-4"
              onFocus={(e) => e.target.select()}
            />
            <div className="flex justify-between">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(popupLink);
                    alert("Copied to clipboard!");
                  } catch {
                    alert("Copy failed");
                  }
                }}
              >
                Copy Link
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => setPopupLink(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
