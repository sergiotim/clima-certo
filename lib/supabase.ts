import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Client-side Supabase client (uses publishable key).
 * Safe to use in browser — RLS policies control access.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
