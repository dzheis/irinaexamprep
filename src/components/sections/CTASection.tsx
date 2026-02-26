"use client";

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

import emailAnimation from '@/../public/lottie/e-mail_default.json';
import instagramAnimation from '@/../public/lottie/instagram_default.json';
import telegramAnimation from '@/../public/lottie/telegram_default.json';

const MAX_TILT_DEG = 2.5;
const TILT_SOFTEN = 0.6;
const TILT_SMOOTH = 0.15;

export default function CTASection() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [email, setEmail] = useState('');
  const [consentSubscribe, setConsentSubscribe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetTiltRef = useRef({ x: 0, y: 0 });

  const handleMouseEnter = () => {
    lottieRef.current?.play();
  };

  const handleMouseLeave = () => {
    lottieRef.current?.stop();
  };

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const inner = cardRef.current;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const halfW = Math.max(rect.width / 2, 1);
    const halfH = Math.max(rect.height / 2, 1);
    const xRatio = Math.max(-1, Math.min(1, (e.clientX - centerX) / halfW)) * TILT_SOFTEN;
    const yRatio = Math.max(-1, Math.min(1, (e.clientY - centerY) / halfH)) * TILT_SOFTEN;
    targetTiltRef.current = {
      x: -yRatio * MAX_TILT_DEG,
      y: xRatio * MAX_TILT_DEG,
    };
    setIsHovering(true);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    targetTiltRef.current = { x: 0, y: 0 };
    setTilt({ x: 0, y: 0 });
    setIsHovering(false);
  }, []);

  useEffect(() => {
    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      const target = targetTiltRef.current;
      setTilt((prev) => {
        const next = {
          x: lerp(prev.x, target.x, TILT_SMOOTH),
          y: lerp(prev.y, target.y, TILT_SMOOTH),
        };
        if (Math.abs(next.x - target.x) < 0.01 && Math.abs(next.y - target.y) < 0.01) {
          return target;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Введите email');
      return;
    }
    if (!consentSubscribe) {
      setError('Необходимо дать согласие на обработку данных для рассылки');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Не удалось подписаться');
        return;
      }
      setIsSuccess(true);
      setEmail('');
    } catch {
      setError('Ошибка соединения. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, [email, consentSubscribe]);

  return (
    <AnimatedSection id="cta" animationDirection="left" containerClassName="max-w-7xl mx-auto">
      <div
        className="relative p-4 cursor-pointer perspective-1000"
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <div
          ref={cardRef}
          className={`card text-center transition-[transform,box-shadow] preserve-3d ${isHovering ? 'duration-[150ms]' : 'duration-500 ease-in-out'} ${isHovering ? 'shadow-xl' : ''}`}
          style={{
            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.02 : 1})`,
          }}
        >
          <h2 className="text-3xl md:text-4xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl font-bold mb-4 text-theme">
            Оставайтесь в курсе новостей
          </h2>
          <p className="text-lg md:text-xl min-[1200px]:text-2xl min-[1200px]:md:text-3xl opacity-90 mb-8 text-theme">
            Подпишитесь на советы, ресурсы и обновления, это совсем не сложно, но очень полезно
          </p>
          <form
            className="group flex flex-col gap-4 max-w-lg mx-auto mb-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onSubmit={handleSubscribe}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={emailAnimation}
                  loop={true}
                  autoplay={false}
                  className="w-full h-full"
                />
              </div>
              <input
                type="email"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 w-full min-w-0 px-6 py-4 rounded-full border bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 input-theme disabled:opacity-70"
                aria-invalid={error ? "true" : undefined}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 shadow-lg btn-cta-subscribe disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isLoading ? 'Отправка…' : 'Подписаться'}
              </button>
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="cta-consent-pd"
                checked={consentSubscribe}
                onChange={(e) => setConsentSubscribe(e.target.checked)}
                className="mt-1 rounded border-theme/30 text-theme-accent focus:ring-theme-accent"
              />
              <label htmlFor="cta-consent-pd" className="text-sm text-theme/90">
                Даю согласие на обработку email в соответствии с{" "}
                <Link href="/privacy" className="underline text-theme-accent hover:text-theme">
                  политикой конфиденциальности
                </Link>
              </label>
            </div>
          </form>
          {isSuccess && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-6" role="status">
              Спасибо! Проверьте почту — мы отправили вам письмо с полезными ссылками.
            </p>
          )}
          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-6" role="alert">
              {error}
            </p>
          )}
          {!isSuccess && !error && <div className="h-0 mb-6" aria-hidden />}

          <div className="flex items-center justify-center gap-8 flex-wrap">
            <Link
              href="https://t.me/elt_survival_guide"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram: Методика"
              className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                <Lottie
                  animationData={telegramAnimation}
                  loop
                  autoplay
                  className="w-full h-full"
                />
              </div>
              <span className="text-sm font-medium text-theme">Методика</span>
            </Link>
            <Link
              href="https://t.me/Irina_Petrova_Eng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram: Личный канал"
              className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                <Lottie
                  animationData={telegramAnimation}
                  loop
                  autoplay
                  className="w-full h-full"
                />
              </div>
              <span className="text-sm font-medium text-theme">Личный канал</span>
            </Link>
            <Link
              href="https://www.instagram.com/cambridge_exams_with_irina?igsh=MXF2Z3V2bmFxZ3BtaQ=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                <Lottie
                  animationData={instagramAnimation}
                  loop
                  autoplay
                  className="w-full h-full"
                />
              </div>
              <span className="text-sm font-medium text-theme">Instagram</span>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
