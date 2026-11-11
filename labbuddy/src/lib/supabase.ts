// One shared connection to our Supabase database.
// The URL and key come from .env.local (on your laptop) or Vercel settings (live site).
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
