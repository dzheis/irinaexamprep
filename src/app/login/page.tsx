"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/ui/PasswordInput";
import { INPUT_BASE_CLASS, INPUT_ERROR_CLASS, EMAIL_REGEX } from "@/lib/auth-form-constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Введите корректный email");
      return;
    }
    if (!password.trim()) {
      setError("Введите пароль");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (err) {
        if (err.message === "Invalid login credentials") {
          setError("Неверный email или пароль");
        } else if (err.message.includes("Email not confirmed")) {
          setError("Подтвердите email по ссылке из письма");
        } else {
          setError(err.message);
        }
        return;
      }
      router.push("/methodology");
      router.refresh();
    } catch {
      setError("Ошибка входа. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-theme text-center mb-6">Вход</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-theme mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              className={`${INPUT_BASE_CLASS} ${emailError ? INPUT_ERROR_CLASS : ""}`}
              autoComplete="email"
              disabled={loading}
            />
            {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-theme mb-1">
              Пароль <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <p className="text-sm">
            <Link href="/forgot-password" className="text-theme-accent hover:underline">
              Забыли пароль?
            </Link>
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
        <p className="text-center text-theme/80 text-sm mt-4">
          Нет аккаунта?{" "}
          <Link href="/signup" className="text-theme-accent hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
