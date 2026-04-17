import { validateSignInCredentials } from "@/domain/auth/credentialsPolicy";
import { signInWithEmailPassword } from "@/infrastructure/auth/supabasePasswordAuth";

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const message = validateSignInCredentials(email, password);
  if (message) {
    return { error: message };
  }

  try {
    const result = await signInWithEmailPassword(email, password);
    if (result.ok) return { error: null };
    if (result.reason === "invalid_credentials") {
      return { error: "Неверный email или пароль" };
    }
    if (result.reason === "email_not_confirmed") {
      return { error: "Подтвердите email по ссылке из письма" };
    }
    return { error: result.message };
  } catch {
    return { error: "Ошибка входа. Попробуйте позже." };
  }
}
