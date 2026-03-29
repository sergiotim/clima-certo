import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

// Keep route module imports safe in tests even when local secrets are absent.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY ??= "test-secret-key";
process.env.UNSUBSCRIBE_TOKEN_SECRET ??= "test-unsubscribe-secret";
