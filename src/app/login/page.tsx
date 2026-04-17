"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import PasswordInput from "@/components/ui/PasswordInput";
import { INPUT_BASE_CLASS, INPUT_ERROR_CLASS } from "@/utils/auth-form-constants";
import { loginAction } from "./loginAction";

const initialState = { error: null, emailError: null };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

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
              className={`${INPUT_BASE_CLASS} ${state.emailError ? INPUT_ERROR_CLASS : ""}`}
              autoComplete="email"
              disabled={isPending}
            />
            {state.emailError && <p className="mt-1 text-sm text-red-500">{state.emailError}</p>}
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
          <p className="text-sm">
            <Link href="/forgot-password" className="text-theme-accent hover:underline">
              Забыли пароль?
            </Link>
          </p>
          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={isPending}>
            {isPending ? "Вход…" : "Войти"}
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
