import { createServerClient } from "@/infrastructure/supabase/server";
import { getServerUser } from "@/infrastructure/auth/supabaseUser";

export type AuthenticatedUserIdentity = {
  id: string;
  email: string;
};

export async function signOutServerSession(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
}

export async function exchangeAuthCodeForSession(code: string): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.exchangeCodeForSession(code);
}

export async function getAuthenticatedUserEmail(): Promise<string | null> {
  const user = await getServerUser();
  return user?.email?.trim().toLowerCase() ?? null;
}

export async function getAuthenticatedUserIdentity(): Promise<AuthenticatedUserIdentity | null> {
  const user = await getServerUser();
  const email = user?.email?.trim().toLowerCase() ?? "";
  if (!user?.id || !email) return null;
  return { id: user.id, email };
}
