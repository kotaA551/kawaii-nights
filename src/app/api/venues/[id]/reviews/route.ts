// src/app/api/venues/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }

  const venueId = context.params.id;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[reviews] error:", error);
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}
