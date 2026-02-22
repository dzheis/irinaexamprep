"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";

function cellChar(char: string) {
  return char === " " ? "\u00A0" : char;
}

const STAGGER = 0.028;

type Props = {
  text: string;
  className?: string;
};

export default function AnimatedButtonText({ text, className = "" }: Props) {
  const chars = text.split("");
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animRef = useRef<gsap.core.Timeline | null>(null);

  const runAnimation = useCallback(() => {
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (letters.length === 0) return;
    if (animRef.current?.isActive()) return;

    const tl = gsap
      .timeline()
      .to(letters, {
        opacity: 0,
        duration: 0.18,
        stagger: STAGGER,
        ease: "power2.in",
      })
      .to(letters, {
        opacity: 1,
        duration: 0.22,
        stagger: STAGGER,
        ease: "power2.out",
      });
    animRef.current = tl;
  }, []);

  return (
    <span
      className={`inline-flex flex-nowrap ${className}`}
      onMouseEnter={runAnimation}
    >
      {chars.map((char, i) => (
        <span
          key={`${i}-${char}`}
          className="relative inline-block align-baseline overflow-hidden"
          style={
            char === " "
              ? { minWidth: "0.25em", width: "0.25em" }
              : undefined
          }
        >
          <span
            className="invisible select-none"
            style={{ font: "inherit" }}
            aria-hidden
          >
            {cellChar(char)}
          </span>
          <span
            ref={(el) => {
              letterRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 overflow-hidden"
            style={{ maxWidth: "100%" }}
          >
            {cellChar(char)}
          </span>
        </span>
      ))}
    </span>
  );
}
