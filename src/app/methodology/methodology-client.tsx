"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MethodologyVideoItem = {
  id: string;
  videoId: string;
  title?: string;
  description: string;
  price?: number;
};

const DEFAULT_PRICE = 1990;

const INPUT_BASE_CLASS =
  "w-full px-4 py-3 rounded-xl border bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-theme-secondary-accent/50 transition-all duration-300 input-theme";

const METHODOLOGY_VIDEOS: MethodologyVideoItem[] = [
  {
    id: "1",
    videoId: "dQw4w9WgXcQ",
    title: "Модуль 1",
    price: 1990,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: "2",
    videoId: "dQw4w9WgXcQ",
    title: "Модуль 2",
    price: 2490,
    description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  },
  {
    id: "3",
    videoId: "dQw4w9WgXcQ",
    title: "Модуль 3",
    price: 1790,
    description:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident. Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
  },
];

type MethodologyClientProps = {
  videos?: MethodologyVideoItem[];
};

type PaymentProduct = { id: string; title: string; price: number };

function PaymentModal({
  product,
  onClose,
}: {
  product: PaymentProduct;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handlePay = async () => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Введите корректный email");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          outSum: product.price,
          email: trimmed,
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
        <p className="text-theme mb-2">
          Сумма: <strong>{product.price} ₽</strong>
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-theme mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={INPUT_BASE_CLASS}
            disabled={loading}
          />
        </div>
        <p className="text-sm text-theme/80 mb-3">
          После нажатия вы перейдёте на защищённую страницу Robokassa для ввода данных карты и оплаты.
        </p>
        <p className="text-xs text-theme/80 mb-3">
          Нажимая кнопку, вы соглашаетесь с{' '}
          <a href="/offer" target="_blank" rel="noopener noreferrer" className="underline text-theme-accent hover:text-theme">
            договором оферты
          </a>.
        </p>
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="btn-primary w-full text-lg px-8 py-4"
        >
          {loading ? "Подготовка…" : "Перейти к оплате"}
        </button>
      </div>
    </div>
  );
}

export default function MethodologyClient({ videos }: MethodologyClientProps) {
  const list = videos && videos.length > 0 ? videos : METHODOLOGY_VIDEOS;
  const [paymentProduct, setPaymentProduct] = useState<PaymentProduct | null>(null);

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <div className="pt-24 md:pt-28">
          <section className="py-20 md:py-28 max-w-[1680px] mx-auto px-4 md:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl min-[1200px]:lg:text-7xl font-bold text-center mb-14 md:mb-20 text-theme">
              Методология
            </h1>

            <div className="flex flex-col gap-8 md:gap-10">
              {list.map((item) => (
                <MethodologyVideoBlock
                  key={item.id}
                  item={item}
                  onBuy={() => setPaymentProduct({ id: item.id, title: item.title ?? "Курс", price: item.price ?? DEFAULT_PRICE })}
                />
              ))}
            </div>
            {paymentProduct && (
              <PaymentModal
                product={paymentProduct}
                onClose={() => setPaymentProduct(null)}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function MethodologyVideoBlock({
  item,
  onBuy,
}: {
  item: MethodologyVideoItem;
  onBuy: () => void;
}) {
  const embedUrl = `https://www.youtube.com/embed/${item.videoId}?rel=0`;

  return (
    <div className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 w-full min-w-0 transition-[transform,box-shadow] duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl md:items-center">
      {/* Left: YouTube video. On mobile above, on desktop vertically centered. */}
      <div className="flex-shrink-0 w-full md:min-w-0 md:w-[48%] lg:w-[50%] flex items-center">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-theme-secondary-accent/10">
          <iframe
            src={embedUrl}
            title={item.title ?? "Видео"}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Right: description and button. On mobile below video. */}
      <div className="flex flex-col flex-1 min-w-0">
        {item.title && (
          <h2 className="text-lg md:text-xl min-[1200px]:text-2xl min-[1200px]:md:text-3xl font-bold mb-4 text-theme">
            {item.title}
          </h2>
        )}
        <div className="prose prose-theme max-w-none text-theme text-justify leading-relaxed [&>*]:text-justify">
          <p className="whitespace-pre-line">{item.description}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <span
            className="inline-flex items-center rounded-full px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg min-[1200px]:text-xl min-[1200px]:md:text-2xl font-semibold text-theme bg-white/80 border border-theme/20 shadow-[0_2px_8px_rgba(47,52,64,0.12),0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] transition-transform duration-300 hover:scale-[1.02]"
            aria-label="Цена"
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
            Купить
          </button>
        </div>
      </div>
    </div>
  );
}
