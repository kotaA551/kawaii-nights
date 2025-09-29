// src/app/api/venues/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";

// Next 15 対応: params が Promise の可能性を考慮
type Ctx =
  | { params: Promise<{ id: string }> }
  | { params: { id: string } };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params; // ← 必ず await で解決

  const supabase = getSupabase();
  if (!supabase) {
    console.error("[reviews] Supabase env missing");
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("venue_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[reviews] error:", error);
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] }, { status: 200 });
}
