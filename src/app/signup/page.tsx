"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";
import { INPUT_BASE_CLASS, INPUT_ERROR_CLASS, EMAIL_REGEX } from "@/utils/auth-form-constants";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Введите корректный email");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Пароль не менее 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error: err } = await signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/methodology`,
        },
      });
      if (err) {
        const msg = (err.message ?? "").trim();
        const lower = msg.toLowerCase();

        if (
          lower.includes("already registered") ||
          (lower.includes("already") && lower.includes("registered"))
        ) {
          setEmailError("Этот email уже зарегистрирован. Войдите или запросите восстановление.");
        } else if (
          lower.includes("password") &&
          (lower.includes("at least") || lower.includes("minimum") || lower.includes("6"))
        ) {
          setPasswordError("Пароль не соответствует требованиям (минимум 6 символов).");
        } else if (
          lower.includes("rate") ||
          lower.includes("too many") ||
          lower.includes("limit")
        ) {
          setError("Слишком много попыток. Подождите несколько минут и попробуйте снова.");
        } else {
          console.error("Signup error:", err);
          setError("Не удалось зарегистрироваться. Попробуйте позже.");
        }
        return;
      }

      if (!data.user) {
        setError("Не удалось завершить регистрацию. Попробуйте позже.");
        return;
      }

      if (data.session) {
        router.push("/methodology");
        router.refresh();
        return;
      }

      setEmailSent(true);
    } catch {
      setError("Ошибка регистрации. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-theme mb-6">Проверьте почту</h1>
          <p className="text-theme/90 mb-6">
            На <strong>{email.trim()}</strong> отправлена ссылка для подтверждения. Перейдите по
            ней, чтобы активировать аккаунт и получить доступ ко всем возможностям.
          </p>
          <Link href="/login" className="btn-primary inline-block py-3 px-8">
            Перейти к входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-theme text-center mb-6">Регистрация</h1>
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
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              hasError={!!passwordError}
              disabled={loading}
              autoComplete="new-password"
            />
            <p className="text-xs text-theme/70 mt-1">Не менее 6 символов</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme mb-1">
              Повторите пароль <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              hasError={!!passwordError}
              disabled={loading}
              autoComplete="new-password"
            />
            {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Регистрация…" : "Зарегистрироваться"}
          </button>
        </form>
        <p className="text-center text-theme/80 text-sm mt-4">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-theme-accent hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
