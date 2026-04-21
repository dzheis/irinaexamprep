import { cache } from "react";
import type { AuthUser } from "@/types/domain";
import { createServerClient } from "@/infrastructure/supabase/server";

/**
 * Single Supabase `auth.getUser()` adapter for the entire request.
 *
 * `getUser()` makes a network round-trip to Supabase Auth and cryptographically
 * verifies the JWT — use it for every authorization decision (payments, purchases,
 * admin, protected downloads, etc.). React.cache dedupes calls within one server
 * request so multiple layers don't hit Supabase multiple times.
 */
export const getServerUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, ...(user.email ? { email: user.email } : {}) };
});

/**
 * DISPLAY-ONLY session read. Uses `auth.getSession()` which reads the cookie
 * locally without a Supabase round-trip (zero network). Faster but NOT
 * cryptographically revalidated, so it MUST NEVER be used for authorization.
 *
 * Safe usage: UI state (navbar username, "logged in" indicator). If the cookie
 * were tampered, the attacker would only mislead their own navbar — every
 * real action on the server still runs through {@link getServerUser}.
 *
 * Do NOT reach for this in any route that reads purchases, starts payments,
 * serves protected content, performs admin checks, or mutates user data.
 */
export const getServerUserForDisplay = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return null;
  return { id: user.id, ...(user.email ? { email: user.email } : {}) };
});
