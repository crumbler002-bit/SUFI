import { NextRequest, NextResponse } from "next/server";
import { searchAPI } from "@/lib/api/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, limit = 10 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const data = await searchAPI(query, limit);

    // Transform: enrich with bestMatchId + explanations
    const results = (data.results || []).map((r: Record<string, unknown>, i: number) => ({
      id: String(r.id || i),
      name: r.name || r.restaurant_name || "Unknown",
      cuisine: r.cuisine || "",
      rating: r.rating || 0,
      tags: r.tags || [],
      score: r.similarity || r.score || r.combined_score || 0,
      trend_score: r.trend_score || 0,
      reason: r.reason || r.description || "",
      price_range: r.price_range || "",
      description: r.description || "",
      city: r.city || "",
    }));

    const bestMatch = results[0] || null;

    const explanations: Record<string, string> = {};
    results.forEach((r: { id: string; reason: string; cuisine: string; score: number }) => {
      explanations[r.id] = r.reason || `Matched: ${r.cuisine} (${(r.score * 100).toFixed(0)}% relevance)`;
    });

    return NextResponse.json({
      results,
      bestMatchId: bestMatch?.id || null,
      explanations,
      count: results.length,
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
