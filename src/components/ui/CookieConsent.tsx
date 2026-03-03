"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent-accepted";

export default function CookieConsent() {
  const [accepted, setAccepted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [hiding, setHiding] = useState(false);

  const handleAccept = useCallback(() => {
    setHiding(true);
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {}
      setAccepted(true);
    }, 400);
  }, []);

  if (accepted) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] px-4 py-3 bg-white/60 backdrop-blur-lg border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-[opacity,transform] duration-400 ease-in-out ${hiding ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
      role="dialog"
      aria-label="Уведомление об использовании cookie"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-justify sm:text-left text-[#2F3440]">
          Мы используем файлы cookie и аналогичные технологии для работы сайта и анализа посещаемости. Продолжая использовать сайт, вы соглашаетесь с{" "}
          <Link href="/privacy" className="underline hover:opacity-90">
            политикой конфиденциальности
          </Link>
          .
        </p>
        <div className="flex items-center justify-center sm:justify-start gap-2 flex-shrink-0 w-full sm:w-auto">
          <Link
            href="/privacy"
            className="text-sm underline hover:opacity-70 px-3 py-2 text-[#2F3440]"
          >
            Подробнее
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-theme hover:opacity-90 transition-opacity"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
