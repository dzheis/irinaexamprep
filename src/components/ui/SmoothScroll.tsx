"use client";

import { useEffect, useRef, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ScrollContextValue = {
  lockScroll: () => void;
  unlockScroll: () => void;
  scrollToSection: (id: string) => void;
  scrollToTop: () => void;
};

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function useScrollLock() {
  const ctx = useContext(ScrollContext);
  return ctx ? { lockScroll: ctx.lockScroll, unlockScroll: ctx.unlockScroll } : null;
}

export function useScrollToSection() {
  const ctx = useContext(ScrollContext);
  return ctx?.scrollToSection ?? null;
}

export function useScrollToTop() {
  const ctx = useContext(ScrollContext);
  return ctx?.scrollToTop ?? null;
}

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const isInitialLoadRef = useRef(true);

  const lockScroll = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const unlockScroll = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  const scrollToTop = useCallback(() => {
    lenisRef.current?.scrollTo(0, { duration: 1.2 });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el || !lenisRef.current) return;
      lenisRef.current.scrollTo(el, { offset: -80, duration: 1.2 });
    });
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tick);
    };
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
      isInitialLoadRef.current = false;
      return;
    }
    const storedId =
      typeof window !== 'undefined' ? sessionStorage.getItem('scrollToSection') : null;
    const hash =
      typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    const targetId = storedId || hash || '';

    if (isInitialLoadRef.current && !storedId) {
      isInitialLoadRef.current = false;
      const t = setTimeout(() => {
        lenisRef.current?.scrollTo(0, { duration: 0 });
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 0);
      return () => clearTimeout(t);
    }
    if (!storedId) {
      isInitialLoadRef.current = false;
    }

    if (!targetId || !lenisRef.current) return;

    if (typeof window !== 'undefined' && storedId) {
      sessionStorage.removeItem('scrollToSection');
    }

    const lenis = lenisRef.current;
    let attempt = 0;
    const maxAttempts = 40;
    const interval = 80;
    const scrollDelay = 250;
    let id: ReturnType<typeof setTimeout> | null = null;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        lenis.resize();
        ScrollTrigger.refresh();
        lenis.scrollTo(el, { offset: -80, duration: 0 });
        return;
      }
      attempt += 1;
      if (attempt < maxAttempts) {
        id = setTimeout(tryScroll, interval);
      }
    };
    id = setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
      tryScroll();
    }, scrollDelay);
    return () => {
      if (id) clearTimeout(id);
    };
  }, [pathname]);

  const contextValue = useMemo(
    () => ({ lockScroll, unlockScroll, scrollToSection, scrollToTop }),
    [lockScroll, unlockScroll, scrollToSection, scrollToTop],
  );

  return (
    <ScrollContext.Provider value={contextValue}>
      {children}
    </ScrollContext.Provider>
  );
}
