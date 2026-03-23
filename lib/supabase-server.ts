import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

/**
 * Server-side Supabase client (uses service role key).
 * NEVER import this in client components — it bypasses RLS.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
