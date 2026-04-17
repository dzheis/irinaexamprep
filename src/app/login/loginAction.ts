"use server";

import { createServerClient } from "@/services/supabaseClient";
import { EMAIL_REGEX } from "@/utils/auth-form-constants";
import { redirect } from "next/navigation";

export type LoginActionState = {
  error: string | null;
  emailError: string | null;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const emailRaw = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const email = emailRaw.trim();

  if (!EMAIL_REGEX.test(email)) {
    return { error: null, emailError: "Введите корректный email" };
  }

  if (!password.trim()) {
    return { error: "Введите пароль", emailError: null };
  }

  try {
    const supabase = await createServerClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      if (err.message === "Invalid login credentials") {
        return { error: "Неверный email или пароль", emailError: null };
      }
      if (err.message.includes("Email not confirmed")) {
        return { error: "Подтвердите email по ссылке из письма", emailError: null };
      }
      return { error: err.message, emailError: null };
    }
  } catch {
    return { error: "Ошибка входа. Попробуйте позже.", emailError: null };
  }

  redirect("/methodology");
}

