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
      // On transitions away from the home page, layout/transform values may change
      // (PageTransition/GSAP), so it's important to sync Lenis with ScrollTrigger.
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
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
    const pinSectionEl =
      typeof window !== 'undefined' ? document.getElementById('courses-methodology') : null;
    const shouldWaitForPin =
      typeof window !== 'undefined' && pinSectionEl
        ? window.matchMedia('(min-width: 1280px)').matches
        : false;
    let attempt = 0;
    const maxAttempts = 40;
    const interval = 80;
    const scrollDelay = shouldWaitForPin ? 0 : 250;
    let id: ReturnType<typeof setTimeout> | null = null;
    let pinPollId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        lenis.resize();
        ScrollTrigger.refresh();
        lenis.scrollTo(el, { offset: -80, duration: 0 });
        // Let the DOM/animations settle, then recalculate positions once.
        requestAnimationFrame(() => {
          lenis.resize();
          ScrollTrigger.refresh();
        });
        setTimeout(() => {
          lenis.resize();
          ScrollTrigger.refresh();
          // Pin spacers / layout changes may land slightly after the first jump.
          // Re-apply the scroll once to ensure the final position is correct.
          lenis.scrollTo(el, { offset: -80, duration: 0 });
        }, 250);
        return;
      }
      attempt += 1;
      if (attempt < maxAttempts) {
        id = setTimeout(tryScroll, interval);
      }
    };

    const waitForPinTrigger = (timeoutMs: number) =>
      new Promise<boolean>((resolve) => {
        const start = performance.now();
        const poll = () => {
          if (cancelled) return resolve(false);
          if (
            ScrollTrigger.getAll().some((st) => st.trigger === pinSectionEl)
          ) {
            return resolve(true);
          }
          if (performance.now() - start >= timeoutMs) return resolve(false);
          pinPollId = setTimeout(poll, 60);
        };
        poll();
      });

    const startScroll = () => {
      lenis.resize();
      ScrollTrigger.refresh();
      tryScroll();
    };

    if (shouldWaitForPin && pinSectionEl) {
      waitForPinTrigger(2500).then(() => {
        if (cancelled) return;
        id = setTimeout(startScroll, scrollDelay);
      });
    } else {
      id = setTimeout(startScroll, scrollDelay);
    }
    return () => {
      cancelled = true;
      if (id) clearTimeout(id);
      if (pinPollId) clearTimeout(pinPollId);
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
