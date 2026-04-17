"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/presentation/routes";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const { getSession, updateUser } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isRecovery = window.location.hash.includes("type=recovery");
    if (isRecovery) {
      setReady(true);
      return;
    }
    getSession().then(({ data: { session } }) => setReady(!!session));
  }, [getSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);
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
      const { error: err } = await updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      router.push(ROUTES.methodology);
      router.refresh();
    } catch {
      setError("Ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md text-center">
          <p className="text-theme/90 mb-6">
            Используйте ссылку из письма для сброса пароля. Если вы перешли по старой ссылке,
            запросите новую на странице «Забыли пароль?».
          </p>
          <Link href={ROUTES.forgotPassword} className="btn-primary inline-block py-3 px-8">
            Запросить ссылку
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-theme text-center mb-6">Новый пароль</h1>
        <p className="text-theme/80 text-sm text-center mb-6">
          Введите новый пароль дважды для подтверждения.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-theme mb-1">
              Новый пароль <span className="text-red-500">*</span>
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
            {loading ? "Сохранение…" : "Сохранить пароль"}
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
