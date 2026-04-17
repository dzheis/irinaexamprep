import { validateSignInCredentials } from "@/domain/auth/credentialsPolicy";
import { createServerClient } from "@/services/supabaseServer";

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const message = validateSignInCredentials(email, password);
  if (message) {
    return { error: message };
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return { error: null };

    if (error.message === "Invalid login credentials") {
      return { error: "Неверный email или пароль" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Подтвердите email по ссылке из письма" };
    }
    return { error: error.message };
  } catch {
    return { error: "Ошибка входа. Попробуйте позже." };
  }
}
