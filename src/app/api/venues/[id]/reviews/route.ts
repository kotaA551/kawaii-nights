// src/app/api/venues/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from("venue_reviews")
    .select("rating,language,nickname,comment,created_at")
    .eq("venue_id", params.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? [], { status: 200 });
}
