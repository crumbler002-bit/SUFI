import { NextResponse } from "next/server";
import { trendingAPI } from "@/lib/api/client";

export async function GET() {
  try {
    const data = await trendingAPI();

    const trends = (Array.isArray(data) ? data : data.trending || []).map(
      (r: Record<string, unknown>, i: number) => ({
        id: String(r.id || i),
        name: r.name || "Unknown",
        trend_score: r.trend_score || r.reservation_count || 0,
        change: r.change || "+0%",
        cuisine: r.cuisine || "",
      })
    );

    return NextResponse.json(trends);
  } catch (err) {
    console.error("Trends API error:", err);
    return NextResponse.json([]);
  }
}
