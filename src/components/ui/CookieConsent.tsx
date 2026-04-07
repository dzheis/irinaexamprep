"use client";

import { useState, useCallback, useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import Link from "next/link";
import {
  getStoredConsent,
  saveConsent,
  type CookieConsentState,
  type CookieCategory,
} from "@/lib/cookie-consent";

const BANNER_BASE_CLASS =
  "fixed bottom-0 left-0 right-0 z-[100] px-4 py-3 bg-white/60 backdrop-blur-lg border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-[opacity,transform] duration-400 ease-in-out";
const BTN_PRIMARY_CLASS =
  "px-4 py-2 rounded-full text-sm font-semibold bg-white text-theme hover:opacity-90 transition-opacity";
const BTN_SECONDARY_CLASS =
  "px-4 py-2 rounded-full text-sm font-semibold border border-[#2F3440]/30 text-[#2F3440] bg-white/80 hover:opacity-90 transition-opacity";
const BTN_LINK_CLASS =
  "px-4 py-2 rounded-full text-sm font-semibold border border-[#2F3440]/55 text-[#1f2329] bg-white/60 hover:opacity-90 transition-opacity";

const CATEGORIES: {
  key: CookieCategory;
  label: string;
  description: string;
  disabled?: boolean;
}[] = [
  {
    key: "necessary",
    label: "Необходимые",
    description: "Нужны для работы сайта. Нельзя отключить.",
    disabled: true,
  },
  { key: "analytics", label: "Аналитика", description: "Помогают понимать, как используют сайт." },
  {
    key: "marketing",
    label: "Маркетинг",
    description: "Используются для рекламы и персонализации.",
  },
  {
    key: "functional",
    label: "Функциональные",
    description: "Запоминают настройки и улучшают опыт.",
  },
];

export type CookieConsentRef = { openPreferences: () => void };

function CookieConsentInner(_: unknown, ref: React.Ref<CookieConsentRef>) {
  const [consent, setConsent] = useState<CookieConsentState>(() => getStoredConsent());
  const [hiding, setHiding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConsent, setModalConsent] = useState<CookieConsentState>(consent);
  const modalClosingRef = useRef(false);

  const persistAndHide = useCallback((next: CookieConsentState) => {
    setHiding(true);
    setTimeout(() => {
      saveConsent(next);
      setConsent(next);
    }, 400);
  }, []);

  const handleAcceptAll = useCallback(() => {
    persistAndHide({
      choiceMade: true,
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  }, [persistAndHide]);

  const handleRejectAll = useCallback(() => {
    persistAndHide({
      choiceMade: true,
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  }, [persistAndHide]);

  const handleCustomize = useCallback(() => {
    setModalConsent({ ...consent });
    setShowModal(true);
    modalClosingRef.current = false;
  }, [consent]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setModalOpen(showModal));
    return () => cancelAnimationFrame(id);
  }, [showModal]);

  const closeModal = useCallback(() => {
    if (modalClosingRef.current) return;
    modalClosingRef.current = true;
    setModalOpen(false);
    setTimeout(() => {
      setShowModal(false);
      modalClosingRef.current = false;
    }, 300);
  }, []);

  const handleSavePreferences = useCallback(() => {
    persistAndHide({ ...modalConsent, choiceMade: true });
    setModalOpen(false);
    setTimeout(() => setShowModal(false), 300);
  }, [modalConsent, persistAndHide]);

  const setModalCategory = useCallback((key: CookieCategory, value: boolean) => {
    if (key === "necessary") return;
    setModalConsent((prev) => ({ ...prev, [key]: value }));
  }, []);

  useImperativeHandle(ref, () => ({ openPreferences: () => setShowModal(true) }), []);

  useEffect(() => {
    if (!showModal) return;
    const id = requestAnimationFrame(() => setModalConsent(getStoredConsent()));
    return () => cancelAnimationFrame(id);
  }, [showModal]);

  if (consent.choiceMade && !showModal) return null;

  return (
    <>
      {!consent.choiceMade && (
        <div
          className={`${BANNER_BASE_CLASS} ${hiding ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
          role="dialog"
          aria-label="Уведомление об использовании cookie"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-justify sm:text-left text-[#2F3440]">
              Мы используем файлы cookie и аналогичные технологии для работы сайта и анализа
              посещаемости. Вы можете принять все, отклонить все или настроить выбор. Подробнее — в{" "}
              <Link href="/privacy" className="underline hover:opacity-90">
                политике конфиденциальности
              </Link>
              .
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-shrink-0 w-full sm:w-auto flex-wrap">
              <button type="button" onClick={handleRejectAll} className={BTN_SECONDARY_CLASS}>
                Отклонить все
              </button>
              <button type="button" onClick={handleCustomize} className={BTN_SECONDARY_CLASS}>
                Настроить
              </button>
              <Link href="/privacy" className={BTN_LINK_CLASS}>
                Подробнее
              </Link>
              <button type="button" onClick={handleAcceptAll} className={BTN_PRIMARY_CLASS}>
                Принять все
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-hidden transition-opacity duration-300 ${
            modalOpen ? "opacity-100" : "opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          onClick={closeModal}
        >
          <div
            className={`card max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 ${
              modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="cookie-preferences-title" className="text-xl font-bold text-theme">
                Настройки cookie
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-theme-accent hover:text-theme text-2xl leading-none p-1"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-theme/80 mb-4">
              Выберите категории cookie, которые разрешаете использовать. Необходимые cookie всегда
              активны.
            </p>
            <ul className="space-y-4 mb-6">
              {CATEGORIES.map(({ key, label, description, disabled }) => (
                <li key={key} className="flex items-start gap-3">
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <span className="relative w-6 h-6 flex-shrink-0 mt-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        id={`cookie-${key}`}
                        checked={modalConsent[key]}
                        disabled={disabled}
                        onChange={(e) => setModalCategory(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <span
                        className="block w-full h-full rounded-full border-2 border-[#2F3440]/30 bg-transparent transition-colors duration-200 peer-checked:border-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400/50 peer-focus-visible:ring-offset-1 peer-disabled:cursor-not-allowed pointer-events-none absolute inset-0"
                        aria-hidden
                      />
                      <span
                        className="absolute inset-1.5 rounded-full bg-blue-500 scale-0 opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100 pointer-events-none"
                        aria-hidden
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-theme">{label}</span>
                      <span className="block text-xs text-theme/80">{description}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleSavePreferences} className={BTN_PRIMARY_CLASS}>
                Сохранить
              </button>
              <button type="button" onClick={closeModal} className={BTN_SECONDARY_CLASS}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const CookieConsent = forwardRef<CookieConsentRef, Record<string, never>>(CookieConsentInner);
CookieConsent.displayName = "CookieConsent";

export default CookieConsent;
