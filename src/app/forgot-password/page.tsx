"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/presentation/routes";
import { INPUT_BASE_CLASS, INPUT_ERROR_CLASS, EMAIL_REGEX } from "@/shared/constants/auth-form";
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Введите корректный email");
      return;
    }
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: err } = await resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${origin}/reset-password`,
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSent(true);
    } catch {
      setError("Ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-theme mb-6">Проверьте почту</h1>
          <p className="text-theme/90 mb-6">
            На <strong>{email.trim()}</strong> отправлена ссылка для сброса пароля. Перейдите по
            ней, чтобы задать новый пароль.
          </p>
          <Link href={ROUTES.login} className="btn-primary inline-block py-3 px-8">
            Вернуться к входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-theme text-center mb-6">
          Забыли пароль?
        </h1>
        <p className="text-theme/80 text-sm text-center mb-6">
          Введите email, указанный при регистрации. Мы отправим ссылку для сброса пароля.
        </p>
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Отправка…" : "Отправить ссылку"}
          </button>
        </form>
        <p className="text-center text-theme/80 text-sm mt-4">
          <Link href={ROUTES.login} className="text-theme-accent hover:underline">
            Вернуться к входу
          </Link>
        </p>
      </div>
    </div>
  );
}
