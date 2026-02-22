"use client";

import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/** Тумблер: true — анимация жалюзи при переходе между страницами, false — обычная навигация без анимации */
const ENABLE_BLINDS_TRANSITION = false;

const numBlinds = 20;

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const prevPathnameRef = useRef<string | null>(null);
  const isNavigatingRef = useRef(false);
  const closeBlindsRef = useRef<((onComplete: () => void) => void) | null>(null);
  const openBlindsRef = useRef<((onComplete: () => void) => void) | null>(null);
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useGSAP(
    () => {
      tl.current = gsap.timeline({ paused: true });
    },
    { scope: containerRef }
  );

  // Начальное состояние жалюзи после монтирования; показываем оверлей только после этого (убираем мелькание фото)
  useEffect(() => {
    if (!ENABLE_BLINDS_TRANSITION) return;
    const container = containerRef.current;
    if (!container || !overlayRef.current) return;
    const blinds = container.querySelectorAll(".blind");
    gsap.set(blinds, { rotationY: 90 });
    overlayRef.current.style.visibility = "visible";
  }, []);

  const closeBlinds = useCallback((onComplete: () => void) => {
    if (overlayRef.current) overlayRef.current.style.pointerEvents = "auto";
    if (tl.current) {
      tl.current.clear();
      tl.current.to(".blind", {
        rotationY: 0,
        duration: 0.4,
        ease: "power2.inOut",
        stagger: { amount: 0.25, from: "random" },
        onComplete,
      });
      tl.current.play();
    } else {
      onComplete();
    }
  }, []);

  const openBlinds = useCallback((onComplete: () => void) => {
    if (overlayRef.current) overlayRef.current.style.pointerEvents = "none";
    if (tl.current) {
      tl.current.clear();
      gsap.set("#page-content", { opacity: 0 });
      tl.current.to("#page-content", {
        opacity: 1,
        duration: 0.4,
        ease: "power2.inOut",
        delay: 0.05,
      });
      tl.current.to(
        ".blind",
        {
          rotationY: 90,
          duration: 0.4,
          ease: "power2.inOut",
          stagger: { amount: 0.25, from: "random" },
          onComplete: () => {
            setIsTransitioning(false);
            onComplete();
          },
        },
        "-=0.35"
      );
      tl.current.play();
    } else {
      gsap.set("#page-content", { opacity: 1 });
      setIsTransitioning(false);
      onComplete();
    }
  }, []);

  useEffect(() => {
    closeBlindsRef.current = closeBlinds;
  }, [closeBlinds]);

  useEffect(() => {
    openBlindsRef.current = openBlinds;
  }, [openBlinds]);

  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  useEffect(() => {
    if (!ENABLE_BLINDS_TRANSITION) return;
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    if (prev === null) return;
    if (prev === pathname) return;
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      setDisplayChildren(children);
      const t = setTimeout(() => {
        openBlindsRef.current?.(() => {});
      }, 50);
      return () => clearTimeout(t);
    }
  }, [pathname, children]);

  useEffect(() => {
    if (!ENABLE_BLINDS_TRANSITION) return;
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || target.target === "_blank" || target.getAttribute("rel") === "noopener noreferrer") return;
      const href = target.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      const current = window.location.pathname;
      const pathOnly = href.replace(/#.*/, "") || "/";
      if (pathOnly === current) return;

      e.preventDefault();
      e.stopPropagation();
      isNavigatingRef.current = true;
      setIsTransitioning(true);
      closeBlindsRef.current?.(() => {
        routerRef.current.push(href);
      });
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <div ref={containerRef} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        id="page-content"
        className="flex min-h-0 flex-1 flex-col"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        {displayChildren}
      </div>

      {ENABLE_BLINDS_TRANSITION && (
        <div
          ref={overlayRef}
          className="pointer-events-none fixed inset-0 z-[100] flex perspective-[1000px]"
          style={{ transform: "translateZ(0)", visibility: "hidden" }}
        >
          {Array.from({ length: numBlinds }).map((_, index) => (
            <div
              key={index}
              className="blind blind-image flex-1 origin-center"
              style={
                {
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(90deg)",
                  ["--start"]: (index / numBlinds) * 100 - 0.5,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
