// pages/affiliate-marketer/overview/overview-report.tsx

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from "recharts";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

interface AffiliateClick {
  _id: string;
  productId: string;
  clickedAt: Date;
}

interface AffiliateEarning {
  _id: string;
  productId: {
    _id?: string;
    name: string;
    slug: string;
    image: string;
  };
  orderId: string;
  commissionAmount: number;
  commissionPercent: number;
  orderAmount: number;
  status: string;
  createdAt: Date;
}

export default function OverviewReport() {
  const { data: session } = useSession();
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [pendingWithdrawTotal, setPendingWithdrawTotal] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    async function fetchData() {
      if (!session?.user?.id) return;
      try {
        // Fetch clicks
        const clicksRes = await axios.get(
          `/api/affiliate/track-click?affiliateUserId=${session.user.id}`
        );
        setClicks(clicksRes.data.clicks);
        setTotalClicks(clicksRes.data.clicks.length);

        // Fetch earnings
        const earningsRes = await axios.get(
          `/api/affiliate/record-earning?affiliateUserId=${session.user.id}`
        );
        setEarnings(earningsRes.data.earnings);
        setTotalEarnings(earningsRes.data.totalEarnings);

        // Fetch withdraws
        const withdrawRes = await axios.get(
          `/api/affiliate/withdraw?affiliateUserId=${session.user.id}`
        );
        setTotalWithdrawn(withdrawRes.data.totalWithdrawn || 0);
        setPendingWithdrawTotal(withdrawRes.data.pendingTotal || 0);

        // Calculate conversion rate using unique orders count returned by earnings API
        const clicksCount = clicksRes.data.clicks.length || 0;
        const uniqueOrders = earningsRes.data.uniqueOrders || 0;
        if (clicksCount > 0) {
          const rate = ((uniqueOrders / clicksCount) * 100).toFixed(2);
          setConversionRate(Number(rate));
        } else {
          setConversionRate(0);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data", err);
        setLoading(false);
      }
    }

    // initial fetch
    fetchData();
    // poll every 10 seconds to show clicks/earnings nearly instantly
    timer = setInterval(fetchData, 10000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [session?.user?.id]);

  // Prepare data for chart (both earnings and click counts)
  const dailyData = processDailyData(clicks, earnings);
  const productData = processProductData(earnings);
  const availableToWithdraw = Math.max(0, totalEarnings - totalWithdrawn - pendingWithdrawTotal);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClicks}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{getCommissionSummary(earnings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-gray-500">Click to order</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Summary (left: earnings+clicks chart, right: concise summary) */}
      {dailyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Earnings & Clicks (last days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="right" dataKey="clicks" fill="#cfcfcf" name="Clicks" />
                    <Line yAxisId="left" type="monotone" dataKey="earnings" stroke="#2ecc71" name="Earnings ($)" strokeWidth={2} dot={{ r: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Summary (Recent)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Total Items Dispatched</div>
                    <div className="font-bold">{earnings.length}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Total Earnings</div>
                    <div className="font-bold">${totalEarnings.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Total Ordered Items</div>
                    <div className="font-bold">{earnings.length}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Clicks</div>
                    <div className="font-bold">{totalClicks}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Conversion</div>
                    <div className="font-bold">{conversionRate}%</div>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <div className="text-sm text-gray-500">Withdrawn</div>
                    <div className="font-bold">${totalWithdrawn.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Pending Withdraw</div>
                    <div className="font-bold">${pendingWithdrawTotal.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Available</div>
                    <div className="font-bold">${availableToWithdraw.toFixed(2)}</div>
                  </div>
                  <div className="pt-3">
                    <button
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded"
                      onClick={async () => {
                        if (!session?.user?.id) return;
                        if (availableToWithdraw <= 0) {
                          alert("No funds available to withdraw.");
                          return;
                        }
                        const input = prompt(
                          `Enter amount to withdraw (max ${availableToWithdraw.toFixed(2)})`,
                          availableToWithdraw.toFixed(2)
                        );
                        if (!input) return;
                        const amount = Number(input);
                        if (isNaN(amount) || amount <= 0 || amount > availableToWithdraw) {
                          alert("Invalid amount");
                          return;
                        }
                        try {
                          const res = await axios.post(`/api/affiliate/withdraw`, {
                            affiliateUserId: session.user.id,
                            amount,
                          });
                          if (res.data.success) {
                            alert("Withdraw request created. Status: pending.");
                            // refresh withdraws
                            const w = await axios.get(`/api/affiliate/withdraw?affiliateUserId=${session.user.id}`);
                            setTotalWithdrawn(w.data.totalWithdrawn || 0);
                            setPendingWithdrawTotal(w.data.pendingTotal || 0);
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Failed to create withdraw request");
                        }
                      }}
                    >
                      Request Withdraw
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Product Performance */}
      {productData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productData.map((product, idx) => (
                <div
                  key={`${product.productId ?? product.productName}-${idx}`}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">{product.productName}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${product.totalEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {product.conversions} conversions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Earnings Table */}
      {earnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Order Amount</th>
                    <th className="text-left py-2">Commission</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning) => (
                    <tr key={earning._id} className="border-b">
                      <td className="py-2">{(typeof earning.productId === 'string') ? 'Product (ID: ' + earning.productId + ')' : (earning.productId?.name || 'Unknown product')}</td>
                      <td className="py-2">${earning.orderAmount.toFixed(2)}</td>
                      <td className="py-2 font-semibold">
                        ${earning.commissionAmount.toFixed(2)}
                        <div className="text-xs text-gray-500">{earning.commissionPercent}%</div>
                      </td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {earning.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {earnings.length === 0 && clicks.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No data yet. Start sharing your affiliate link!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Return a short commission summary string: if all earnings share same percent show "X% commission", otherwise "Commission varies"
function getCommissionSummary(earnings: { commissionPercent: number | string }[]) {
  if (!earnings || earnings.length === 0) return "";
  const percents = new Set(earnings.map((e) => Number(e.commissionPercent || 0)));
  if (percents.size === 1) {
    const val = Array.from(percents)[0];
    return `${val}% commission`;
  }
  return "Commission varies";
}

// Helper function to process daily data
function processDailyData(
  clicks: AffiliateClick[],
  earnings: AffiliateEarning[]
): Array<{ date: string; earnings: number; clicks: number }> {
  const earningsMap = new Map<string, number>();
  const clicksMap = new Map<string, number>();

  earnings.forEach((earning) => {
    const date = new Date(earning.createdAt).toLocaleDateString();
    const current = earningsMap.get(date) || 0;
    earningsMap.set(date, current + earning.commissionAmount);
  });

  clicks.forEach((c) => {
    const date = new Date(c.clickedAt).toLocaleDateString();
    const current = clicksMap.get(date) || 0;
    clicksMap.set(date, current + 1);
  });

  const allDates = new Set<string>([...earningsMap.keys(), ...clicksMap.keys()]);

  const result = Array.from(allDates).map((date) => ({
    date,
    earnings: earningsMap.get(date) || 0,
    clicks: clicksMap.get(date) || 0,
  }));

  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Helper function to process product data
function processProductData(
  earnings: AffiliateEarning[]
): Array<{
  productId: string;
  productName: string;
  sales: number;
  conversions: number;
  totalEarnings: number;
}> {
  const productMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      sales: number;
      conversions: number;
      totalEarnings: number;
    }
  >();

    earnings.forEach((earning) => {
    const productId = typeof earning.productId === 'string' ? earning.productId : (earning.productId._id || earning.productId.name || String(earning._id));
    const existing = productMap.get(productId) || {
      productId,
      productName: typeof earning.productId === 'string' ? ('Product (ID: ' + earning.productId + ')') : (earning.productId.name || 'Unknown product'),
      sales: 0,
      conversions: 0,
      totalEarnings: 0,
    };

    productMap.set(productId, {
      ...existing,
      sales: existing.sales + earning.orderAmount,
      conversions: existing.conversions + 1,
      totalEarnings: existing.totalEarnings + earning.commissionAmount,
    });
  });

  return Array.from(productMap.values()).sort(
    (a, b) => b.totalEarnings - a.totalEarnings
  );
}
