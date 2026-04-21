"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PasswordInput from "@/components/ui/PasswordInput";
import TurnstileWidget, {
  isTurnstileConfigured,
  type TurnstileWidgetHandle,
} from "@/components/security/TurnstileWidget";
import { ROUTES } from "@/shared/constants/routes";
import { INPUT_BASE_CLASS } from "@/shared/constants/auth-form";
import { loginAction } from "./loginAction";

const initialState = { error: null };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileWidgetHandle | null>(null);
  const captchaRequired = isTurnstileConfigured();
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const lastStateRef = useRef(state);

  useEffect(() => {
    if (state !== lastStateRef.current && state.error) {
      queueMicrotask(() => {
        setCaptchaToken(null);
        captchaRef.current?.reset();
      });
    }
    lastStateRef.current = state;
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-theme text-center mb-6">Вход</h1>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-theme mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_BASE_CLASS}
              autoComplete="email"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme mb-1">
              Пароль <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              autoComplete="current-password"
            />
            <input type="hidden" name="password" value={password} />
          </div>
          <input type="hidden" name="captchaToken" value={captchaToken ?? ""} />
          <TurnstileWidget
            handleRef={captchaRef}
            onToken={(t) => setCaptchaToken(t)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
          <p className="text-sm">
            <Link href={ROUTES.forgotPassword} className="text-theme-accent hover:underline">
              Забыли пароль?
            </Link>
          </p>
          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={isPending || (captchaRequired && !captchaToken)}
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Вход…
              </span>
            ) : (
              "Войти"
            )}
          </button>
        </form>
        <p className="text-center text-theme/80 text-sm mt-4">
          Нет аккаунта?{" "}
          <Link href={ROUTES.signup} className="text-theme-accent hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
