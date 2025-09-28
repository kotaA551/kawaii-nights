// server-side only
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!, // 読み取りは anon でも可だが、ここは確実に取るためSRで
  { auth: { persistSession: false } }
);
