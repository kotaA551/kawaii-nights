// src/app/api/venues/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = getSupabase();

  // env 未設定時はローカルの JSON を返してビルドを通す
  if (!supabase) {
    const shops = (await import("@/data/shops.json")).default;
    return NextResponse.json(shops, { status: 200 });
  }

  const { data, error } = await supabase.from("venues").select("*").limit(500);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? [], { status: 200 });
}
