"use client";

import { useEffect } from "react";

const SCROLL_LOCK_CLASS = "scroll-locked";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const html = document.documentElement;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      html.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
      html.classList.add(SCROLL_LOCK_CLASS);
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      if (scrollbarWidth > 0) {
        html.classList.remove(SCROLL_LOCK_CLASS);
        html.style.removeProperty("--scrollbar-width");
      }
    };
  }, [locked]);
}
