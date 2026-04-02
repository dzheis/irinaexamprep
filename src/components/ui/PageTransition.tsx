"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DURATION = 0.25;
const EASE = "power2.out";
const EXIT_SCALE = 0.95;

const PIN_BREAKPOINT = "(min-width: 1280px)";

/** On the desktop home page there is a pinned section where page-transition animation is disabled. */
function useHasPinSection() {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PIN_BREAKPOINT);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return pathname === "/" && isDesktop;
}

function useIsDesktopForPin() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PIN_BREAKPOINT);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasPinSection = useHasPinSection();
  const isDesktopForPin = useIsDesktopForPin();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPathnameRef = useRef<string | null>(null);

  const useTransition = !hasPinSection;

  // Enter: zoom + fade in (only when there is no pinned section).
  useEffect(() => {
    if (!useTransition) return;
    const content = contentRef.current;
    if (!content) return;

    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (prev === null) return;
    if (prev === pathname) return;

    gsap.set(content, { opacity: 0, scale: EXIT_SCALE });
    gsap.to(content, {
      opacity: 1,
      scale: 1,
      duration: DURATION,
      ease: EASE,
      onComplete: () => {
        gsap.set(content, { clearProps: "transform,opacity" });
        ScrollTrigger.refresh();
      },
    });
  }, [pathname, useTransition]);

  // Click interception: exit animation first, then navigate
  // (only when we use transitions and the target isn't the pinned home section).
  useEffect(() => {
    if (!useTransition) return;
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || target.target === "_blank" || target.getAttribute("rel") === "noopener noreferrer") return;
      const href = target.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      const pathOnly = href.replace(/#.*/, "") || "/";
      if (pathOnly === window.location.pathname) return;

      // Home section navigation like "/#about" or "/#cta":
      // On some environments (e.g. Vercel) applying the hash directly conflicts with
      // pinned sections (ScrollTrigger pin), which leads to layout/scroll desync.
      // Instead, switch to "/" and let `SmoothScroll` handle scrolling via sessionStorage.
      const hashMatch = href.match(/^\/#([^?]+)$/);
      if (pathOnly === '/' && hashMatch?.[1]) {
        const anchorId = hashMatch[1];
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('scrollToSection', anchorId);
        }
        e.preventDefault();
        router.push('/');
        return;
      }

      if (pathOnly === "/" && isDesktopForPin) {
        e.preventDefault();
        router.push(href);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      const content = contentRef.current;
      if (!content) {
        router.push(href);
        return;
      }

      gsap.to(content, {
        opacity: 0,
        scale: EXIT_SCALE,
        duration: DURATION,
        ease: EASE,
        onComplete: () => {
          ScrollTrigger.getAll().forEach((st) => st.kill());
          router.push(href);
        },
      });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [router, useTransition, isDesktopForPin]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        id="page-content"
        ref={contentRef}
        className="relative flex min-h-0 flex-1 flex-col origin-center"
      >
        {children}
      </div>
    </div>
  );
}
