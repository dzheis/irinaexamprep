"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/ui/LanguageContext";
import { useUser } from "@/hooks/useUser";
import { usePurchases } from "@/hooks/usePurchases";
import { useCsrfToken } from "@/hooks/useCsrfToken";
import { validatePlainEmail } from "@/application/useCases/auth/resetPassword";
import {
  canOpenPaymentModal,
  getMethodologyProductPriceRub,
  isModulePurchased,
} from "@/application/useCases/methodology/methodologyAccess";
import { ROUTES } from "@/shared/constants/routes";
import type { MethodologyVideoItem } from "@/types/methodology";

export type { MethodologyVideoItem };

const DEFAULT_PRICE = getMethodologyProductPriceRub("1") ?? 1990;

const INPUT_BASE_CLASS =
  "w-full px-4 py-3 rounded-xl border bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-theme-secondary-accent/50 transition-all duration-300 input-theme";

const METHODOLOGY_VIDEOS: MethodologyVideoItem[] = [
  {
    id: "1",
    title: "Why Teaching ≠ Learning: a way towards conscious teaching",
    price: DEFAULT_PRICE,
    description:
      "Teachers often do “everything right”: plan carefully, explain clearly, choose good materials, run communicative activities, and still see slow, uneven progress. Students forget, plateau, and repeat the same errors. This webinar explains why that happens and how to teach more consciously, without overteaching or burning out.\n\nThe core idea is that teaching creates conditions, while learning is what the learner actually processes, retains, and can use later. These are not the same process, and confusing them leads to predictable classroom problems, which we also discuss in the webinar.",
  },
];

type MethodologyClientProps = {
  videos?: MethodologyVideoItem[];
  pageTitle?: string;
};

type PaymentProduct = { id: string; title: string; price: number };

function PaymentModal({
  product,
  prefilledEmail,
  csrfToken,
  onClose,
}: {
  product: PaymentProduct;
  prefilledEmail?: string | null;
  csrfToken?: string | null;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  const startClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const el = overlayRef.current;
    if (!el) {
      onClose();
      return;
    }
    const onEnd = () => onClose();
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [isClosing, onClose]);

  const handlePay = async () => {
    if (!csrfToken) {
      setError("Безопасность: перезагрузите страницу и попробуйте ещё раз.");
      return;
    }
    const trimmed = (prefilledEmail ?? email).trim();
    const emailErr = validatePlainEmail(trimmed);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) headers["x-csrf-token"] = csrfToken;
      const res = await fetch("/api/pay", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          productId: product.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось создать платёж");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setError("Нет ссылки на оплату");
    } catch {
      setError("Ошибка соединения. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const show = isOpen && !isClosing;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 overflow-hidden touch-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={isClosing ? undefined : startClose}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
        e.stopPropagation();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        className={`card max-w-md w-full shadow-2xl transition-all duration-300 touch-auto ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 id="payment-modal-title" className="text-xl font-bold text-theme">
            Оплата — {product.title}
          </h3>
          <button
            type="button"
            onClick={startClose}
            className="text-theme-accent hover:text-theme text-2xl leading-none p-1"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <p className="text-sm font-medium text-theme mb-2">
          Сумма: <strong>{product.price} ₽</strong>
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-theme mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={INPUT_BASE_CLASS}
            disabled={loading || !!prefilledEmail}
          />
        </div>
        <p className="text-sm text-theme/80 mb-3">
          После нажатия вы перейдёте на защищённую страницу Robokassa для ввода данных карты и
          оплаты.
        </p>
        <p className="text-xs text-theme/80 mb-3">
          Нажимая кнопку, вы соглашаетесь с{" "}
          <a
            href={ROUTES.offer}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-theme-accent hover:text-theme"
          >
            договором оферты
          </a>
          .
        </p>
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <button
          type="button"
          onClick={handlePay}
          disabled={loading || !csrfToken}
          className="btn-primary w-full text-lg px-8 py-4"
        >
          {loading ? "Подготовка…" : "Перейти к оплате"}
        </button>
      </div>
    </div>
  );
}

function AuthRequiredModal({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const startClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const el = overlayRef.current;
    if (!el) {
      onClose();
      return;
    }
    const onEnd = () => onClose();
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [isClosing, onClose]);

  const show = isOpen && !isClosing;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 overflow-hidden touch-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={isClosing ? undefined : startClose}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
        e.stopPropagation();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
    >
      <div
        className={`card max-w-md w-full shadow-2xl transition-all duration-300 touch-auto ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button
          type="button"
          onClick={startClose}
          className="text-theme-accent hover:text-theme text-2xl leading-none p-1 absolute top-2 right-2"
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="mb-5">
          <h3
            id="auth-required-title"
            className="text-xl font-bold text-theme text-center w-full px-10"
          >
            Для покупки данного видео войдите или зарегистрируйтесь
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={ROUTES.login} className="btn-primary w-full text-lg px-8 py-4 text-center">
            Войти
          </Link>
          <Link href={ROUTES.signup} className="btn-secondary w-full text-lg px-8 py-4 text-center">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaymentResultModal({
  variant,
  onClose,
}: {
  variant: "success" | "fail";
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const startClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const el = overlayRef.current;
    if (!el) {
      onClose();
      return;
    }
    const onEnd = () => onClose();
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [isClosing, onClose]);

  const isSuccess = variant === "success";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [startClose]);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      aria-modal="true"
      aria-labelledby="payment-result-title"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={startClose}
        onKeyDown={(e) => e.key === "Escape" && startClose()}
      />
      <div
        className={`relative glass rounded-2xl p-6 md:p-8 max-w-md w-full shadow-xl transition-transform duration-300 ${
          isOpen && !isClosing ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
              isSuccess ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
            }`}
            aria-hidden
          >
            {isSuccess ? (
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h2 id="payment-result-title" className="text-xl font-bold text-theme">
            {isSuccess ? "Платёж успешен" : "Платёж не прошёл"}
          </h2>
          <p className="text-theme/80 text-sm md:text-base">
            {isSuccess
              ? "Спасибо за оплату. Мы свяжемся с вами по указанной почте."
              : "Операция была отменена или произошла ошибка. Попробуйте ещё раз или свяжитесь с нами."}
          </p>
          <button type="button" onClick={startClose} className="btn-primary mt-2 px-8 py-3">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_PAGE_TITLE = "Методология";

export default function MethodologyClient({ videos, pageTitle }: MethodologyClientProps) {
  const { localizeText } = useLanguage();
  const list = videos && videos.length > 0 ? videos : METHODOLOGY_VIDEOS;
  const title = pageTitle?.trim() || DEFAULT_PAGE_TITLE;
  const [paymentProduct, setPaymentProduct] = useState<PaymentProduct | null>(null);
  const [authRequiredOpen, setAuthRequiredOpen] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useUser([]);
  const {
    moduleIds: purchasedModuleIds,
    loading: purchasesLoading,
    refetch: refetchPurchases,
  } = usePurchases([searchParams.get("payment")]);
  const { token: csrfToken } = useCsrfToken();
  const paymentFromUrl =
    searchParams.get("payment") === "success"
      ? "success"
      : searchParams.get("payment") === "fail"
        ? "fail"
        : null;
  const [resultDismissed, setResultDismissed] = useState(false);
  const paymentResult = paymentFromUrl && !resultDismissed ? paymentFromUrl : null;
  const isAuthed = !!user;
  const userEmail = typeof user?.email === "string" ? user.email : null;

  const handleBuy = (item: MethodologyVideoItem) => {
    const alreadyPurchased = isModulePurchased(purchasedModuleIds, item.id);
    if (alreadyPurchased) return;
    if (!canOpenPaymentModal({ isAuthed, purchasedModuleIds, moduleId: item.id })) {
      setAuthRequiredOpen(true);
      return;
    }
    setPaymentProduct({
      id: item.id,
      title: item.title ?? "Курс",
      price: item.price ?? DEFAULT_PRICE,
    });
  };

  const closePaymentResult = useCallback(() => {
    setResultDismissed(true);
    refetchPurchases();
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [refetchPurchases]);

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <div className="pt-24 md:pt-28">
          <section className="py-20 md:py-28 max-w-[1680px] mx-auto px-4 md:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl min-[1200px]:lg:text-7xl font-bold text-center mb-14 md:mb-20 text-theme">
              {localizeText(title)}
            </h1>

            <div className="flex flex-col gap-8 md:gap-10">
              {purchasesLoading && (
                <p className="text-sm text-theme/70">{localizeText("Проверяем доступ к материалам...")}</p>
              )}
              {list.map((item) => (
                <MethodologyVideoBlock
                  key={item.id}
                  item={{
                    id: item.id,
                    description: localizeText(item.description),
                    ...(typeof item.price === "number" ? { price: item.price } : {}),
                    ...(item.title ? { title: localizeText(item.title) } : {}),
                  }}
                  hasAccess={purchasedModuleIds.includes(item.id)}
                  onBuy={() => handleBuy(item)}
                />
              ))}
            </div>
            {paymentProduct && (
              <PaymentModal
                product={paymentProduct}
                prefilledEmail={userEmail}
                onClose={() => setPaymentProduct(null)}
                csrfToken={csrfToken}
              />
            )}
            {paymentResult && (
              <PaymentResultModal variant={paymentResult} onClose={closePaymentResult} />
            )}
            {authRequiredOpen && <AuthRequiredModal onClose={() => setAuthRequiredOpen(false)} />}
          </section>
        </div>
      </div>
    </div>
  );
}

function MethodologyVideoBlock({
  item,
  hasAccess,
  onBuy,
}: {
  item: MethodologyVideoItem;
  hasAccess: boolean;
  onBuy: () => void;
}) {
  const { localizeText } = useLanguage();
  return (
    <div className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 w-full min-w-0 transition-[transform,box-shadow] duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl md:items-center">
      <div
        className="flex-shrink-0 w-full md:min-w-0 md:w-[48%] lg:w-[50%] flex items-center"
        onContextMenu={(e) => hasAccess && e.preventDefault()}
      >
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-theme-secondary-accent/10">
          {hasAccess ? (
            <>
              <iframe
                src={`/api/video-embed?module=${encodeURIComponent(item.id)}`}
                title={item.title ?? localizeText("Видео")}
                className="absolute inset-0 w-full h-full z-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black/55 to-transparent z-10 pointer-events-none"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-theme/70">
              <svg
                className="w-12 h-12 md:w-16 md:h-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <span className="text-sm md:text-base text-center px-4">
                {localizeText("Доступ после оплаты")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {item.title && (
          <h2 className="text-lg md:text-xl min-[1200px]:text-2xl min-[1200px]:md:text-3xl font-bold mb-4 text-theme">
            {item.title}
          </h2>
        )}
        <div className="prose prose-theme max-w-none text-theme text-justify leading-relaxed [&>*]:text-justify">
          <p className="whitespace-pre-line">{item.description}</p>
        </div>
        {!hasAccess && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <span
              className="inline-flex items-center rounded-full px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg min-[1200px]:text-xl min-[1200px]:md:text-2xl font-semibold text-theme bg-white/80 border border-theme/20 shadow-[0_2px_8px_rgba(47,52,64,0.12),0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] transition-transform duration-300 hover:scale-[1.02]"
              aria-label={localizeText("Цена")}
            >
              {typeof item.price === "number"
                ? item.price.toLocaleString("ru-RU")
                : DEFAULT_PRICE.toLocaleString("ru-RU")}{" "}
              ₽
            </span>
            <button
              type="button"
              onClick={onBuy}
              className="btn-primary text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl px-10 py-3 md:py-4 min-w-[200px]"
            >
              {localizeText("Купить")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
