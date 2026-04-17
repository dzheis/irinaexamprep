import { createServerClient } from "@/infrastructure/supabase/server";

export type SupabasePasswordSignInResult =
  | { ok: true }
  | { ok: false; reason: "invalid_credentials" | "email_not_confirmed" | "other"; message: string };

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<SupabasePasswordSignInResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return { ok: true };

  if (error.message === "Invalid login credentials") {
    return { ok: false, reason: "invalid_credentials", message: error.message };
  }
  if (error.message.includes("Email not confirmed")) {
    return { ok: false, reason: "email_not_confirmed", message: error.message };
  }
  return { ok: false, reason: "other", message: error.message };
}
