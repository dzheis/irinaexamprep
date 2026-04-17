import { createServerClient } from "@/infrastructure/supabase/server";
import { getServerUser } from "@/infrastructure/auth/supabaseUser";

export async function signOutServerSession(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
}

export async function exchangeAuthCodeForSession(code: string): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.exchangeCodeForSession(code);
}

/**
 * Normalized email of the authenticated user or null.
 * Derived from the single `getServerUser` primitive to avoid duplicate auth.getUser() calls per request.
 */
export async function getAuthenticatedUserEmail(): Promise<string | null> {
  const user = await getServerUser();
  return user?.email?.trim().toLowerCase() ?? null;
}
