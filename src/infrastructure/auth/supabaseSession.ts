import { createServerClient } from "@/infrastructure/supabase/server";

export async function signOutServerSession(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
}

export async function exchangeAuthCodeForSession(code: string): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.exchangeCodeForSession(code);
}

export async function getAuthenticatedUserEmail(): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email?.trim().toLowerCase() ?? null;
}
