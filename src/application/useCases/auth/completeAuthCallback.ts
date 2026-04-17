import { exchangeAuthCodeForSession } from "@/infrastructure/auth/supabaseSession";

export async function completeAuthCodeExchange(code: string | null): Promise<void> {
  if (!code) return;
  await exchangeAuthCodeForSession(code);
}
