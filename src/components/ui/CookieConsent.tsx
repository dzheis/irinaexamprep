"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent-accepted";

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setAccepted(stored === "true");
    } catch {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      setAccepted(true);
    } catch {
      setAccepted(true);
    }
  };

  if (!mounted || accepted) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 py-3 bg-theme/95 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      role="dialog"
      aria-label="Уведомление об использовании cookie"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-justify sm:text-left">
          Мы используем файлы cookie и аналогичные технологии для работы сайта и анализа посещаемости. Продолжая использовать сайт, вы соглашаетесь с{" "}
          <Link href="/privacy" className="underline hover:opacity-90">
            политикой конфиденциальности
          </Link>
          .
        </p>
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <Link
            href="/privacy"
            className="text-sm underline hover:opacity-90 px-3 py-2"
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
