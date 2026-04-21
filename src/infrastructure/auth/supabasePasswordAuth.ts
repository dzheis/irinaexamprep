import { createServerClient } from "@/infrastructure/supabase/server";

export type SupabasePasswordSignInResult =
  | { ok: true }
  | {
      ok: false;
      reason: "invalid_credentials" | "email_not_confirmed" | "captcha_failed" | "other";
      message: string;
    };

export async function signInWithEmailPassword(
  email: string,
  password: string,
  options?: { captchaToken?: string },
): Promise<SupabasePasswordSignInResult> {
  const supabase = await createServerClient();
  const captchaToken = options?.captchaToken?.trim();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    ...(captchaToken ? { options: { captchaToken } } : {}),
  });
  if (!error) return { ok: true };

  const lower = error.message.toLowerCase();

  if (error.message === "Invalid login credentials") {
    return { ok: false, reason: "invalid_credentials", message: error.message };
  }
  if (error.message.includes("Email not confirmed")) {
    return { ok: false, reason: "email_not_confirmed", message: error.message };
  }
  if (lower.includes("captcha") || lower.includes("turnstile")) {
    return { ok: false, reason: "captcha_failed", message: error.message };
  }
  return { ok: false, reason: "other", message: error.message };
}
