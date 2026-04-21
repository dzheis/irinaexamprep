import { validateSignInCredentials } from "@/domain/auth/credentialsPolicy";
import { signInWithEmailPassword } from "@/infrastructure/auth/supabasePasswordAuth";

export async function signIn(
  email: string,
  password: string,
  options?: { captchaToken?: string },
): Promise<{ error: string | null }> {
  const message = validateSignInCredentials(email, password);
  if (message) {
    return { error: message };
  }

  try {
    const result = await signInWithEmailPassword(
      email,
      password,
      options?.captchaToken ? { captchaToken: options.captchaToken } : undefined,
    );
    if (result.ok) return { error: null };
    if (result.reason === "invalid_credentials") {
      return { error: "Неверный email или пароль" };
    }
    if (result.reason === "email_not_confirmed") {
      return { error: "Подтвердите email по ссылке из письма" };
    }
    if (result.reason === "captcha_failed") {
      return { error: "Проверка антибот не пройдена. Попробуйте ещё раз." };
    }
    return { error: result.message };
  } catch {
    return { error: "Ошибка входа. Попробуйте позже." };
  }
}
