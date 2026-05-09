import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/**
 * Admin client — uses the service-role key. Bypasses RLS.
 * NEVER expose this client (or its key) to the browser.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Anon client — used to validate user JWTs via auth.getUser(token).
 */
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
