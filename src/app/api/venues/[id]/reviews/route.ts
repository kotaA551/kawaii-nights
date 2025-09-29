// src/app/api/venues/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } } // ← 分割代入＋ここに型
) {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[reviews] Supabase env missing");
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }

  const { id } = params;

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
