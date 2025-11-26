// app/api/affiliate/report/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Return a small mock dataset if you don't have a real reporting endpoint.
  const now = new Date();
  const data = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(now.getTime() - (13 - i) * 86400000);
    return { date: d.toLocaleDateString(), earnings: Math.round(Math.random() * 30), clicks: Math.round(Math.random() * 150) };
  });
  return NextResponse.json({ data });
}
