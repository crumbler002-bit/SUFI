import { NextRequest, NextResponse } from "next/server";
import { conciergeAPI } from "@/lib/api/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, session_id } = body;

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const data = await conciergeAPI(query, session_id);

    // Extract recommended restaurant IDs from backend response
    const recommended_ids: string[] = [];
    if (data.restaurants && Array.isArray(data.restaurants)) {
      data.restaurants.forEach((r: Record<string, unknown>) => {
        if (r.id) recommended_ids.push(String(r.id));
      });
    }

    return NextResponse.json({
      text: data.reply || data.text || "I can help you find the perfect spot.",
      recommended_ids,
      session_id: data.session_id || session_id,
      intent: data.intent || "",
      suggestions: data.suggestions || [],
    });
  } catch (err) {
    console.error("AI API error:", err);
    return NextResponse.json(
      { text: "I'm having trouble connecting. Please try again.", recommended_ids: [] },
      { status: 200 } // Don't break the UI
    );
  }
}
