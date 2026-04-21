"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";
import TurnstileWidget, {
  isTurnstileConfigured,
  type TurnstileWidgetHandle,
} from "@/components/security/TurnstileWidget";
import { validateSignUpForm } from "@/application/useCases/auth/signUp";
import { ROUTES } from "@/shared/constants/routes";
import { INPUT_BASE_CLASS, INPUT_ERROR_CLASS } from "@/shared/constants/auth-form";
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileWidgetHandle | null>(null);
  const captchaRequired = isTurnstileConfigured();
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    const trimmedEmail = email.trim();
    const check = validateSignUpForm({
      email: trimmedEmail,
      password,
      confirmPassword,
    });
    if (!check.ok) {
      if (check.field === "email") setEmailError(check.message);
      else setPasswordError(check.message);
      return;
    }
    if (captchaRequired && !captchaToken) {
      setError("Пожалуйста, подтвердите, что вы не робот.");
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
          ...(captchaToken ? { captchaToken } : {}),
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
          lower.includes("captcha") ||
          lower.includes("turnstile")
        ) {
          setError("Проверка антибот не пройдена. Попробуйте ещё раз.");
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
        setCaptchaToken(null);
        captchaRef.current?.reset();
        return;
      }

      if (!data.user) {
        setError("Не удалось завершить регистрацию. Попробуйте позже.");
        return;
      }

      if (data.session) {
        router.push(ROUTES.methodology);
        router.refresh();
        return;
      }

      setEmailSent(true);
    } catch {
      setError("Ошибка регистрации. Попробуйте позже.");
      setCaptchaToken(null);
      captchaRef.current?.reset();
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
          <Link href={ROUTES.login} className="btn-primary inline-block py-3 px-8">
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
            <p className="text-xs text-theme/70 mt-1">
              Не менее 12 символов, включая цифру и спецсимвол
            </p>
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
          <TurnstileWidget
            handleRef={captchaRef}
            onToken={(t) => setCaptchaToken(t)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading || (captchaRequired && !captchaToken)}
          >
            {loading ? "Регистрация…" : "Зарегистрироваться"}
          </button>
        </form>
        <p className="text-center text-theme/80 text-sm mt-4">
          Уже есть аккаунт?{" "}
          <Link href={ROUTES.login} className="text-theme-accent hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
