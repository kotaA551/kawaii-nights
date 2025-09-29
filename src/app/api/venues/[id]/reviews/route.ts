// src/app/api/venues/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";

// ✅ Nextが期待する“RouteContext”に一致する形で受ける（独自型は作らない）
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

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
