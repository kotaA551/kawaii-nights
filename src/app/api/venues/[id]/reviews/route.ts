// src/app/api/venues/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";

export async function GET(_req: Request, ctx: any) {
  // params が同期/Promise どちらでも拾えるようにする
  const raw = ctx?.params;
  const params = typeof raw?.then === "function" ? await raw : raw;
  const id = params?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ reviews: [] }, { status: 400 });
  }

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
