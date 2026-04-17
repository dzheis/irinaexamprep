import { z } from "zod";
import { createServerClient } from "@/services/supabaseServer";

const signInSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const validation = signInSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Некорректные данные" };
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

