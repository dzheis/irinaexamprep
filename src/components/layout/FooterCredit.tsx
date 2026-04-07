"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";

const CREDIT_TEXT = "© 2026 Designed & Developed by K. Savchenko";
const CREDIT_CHARS = CREDIT_TEXT.split("");
const BOUNCE_UP = 0.1;
const BOUNCE_DOWN = 0.14;
const STAGGER = 0.025;
const Y_OFF = -6;

export default function FooterCredit() {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const isAnimatingRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const runBounce = useCallback(() => {
    const refs = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (refs.length !== CREDIT_CHARS.length || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    timelineRef.current?.kill();
    gsap.set(refs, { y: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        gsap.set(refs, { clearProps: "y" });
      },
    });

    refs.forEach((el, i) => {
      tl.to(el, { y: Y_OFF, duration: BOUNCE_UP, ease: "power2.out" }, i * STAGGER).to(
        el,
        { y: 0, duration: BOUNCE_DOWN, ease: "power2.in" },
        i * STAGGER + BOUNCE_UP,
      );
    });

    timelineRef.current = tl;
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isAnimatingRef.current) runBounce();
  }, [runBounce]);

  return (
    <a
      href="https://www.linkedin.com/in/kyrylo-savchenko/"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleMouseEnter}
      className="footer-credit-link text-xs md:text-sm min-[1200px]:text-base min-[1200px]:md:text-lg text-theme no-underline cursor-pointer inline-block relative z-10"
    >
      {CREDIT_CHARS.map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            letterRefs.current[i] = el;
          }}
          className="footer-credit-char inline-block will-change-transform"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </a>
  );
}
