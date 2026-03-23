'use client';

import { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

const FADE_MS = 220;

/** Подсказка при наведении: рендер в body, поверх всего, плавное появление и затухание. */
export default function Tooltip({ label, children, className = '' }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const [opacityVisible, setOpacityVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 6,
    });
  }, []);

  const handleEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    showTimeoutRef.current = setTimeout(() => {
      showTimeoutRef.current = null;
      updatePosition();
      setMounted(true);
    }, 150);
  }, [updatePosition]);

  const handleLeave = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    setOpacityVisible(false);
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      setMounted(false);
    }, FADE_MS);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = requestAnimationFrame(() => {
      setOpacityVisible(true);
    });
    return () => cancelAnimationFrame(t);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [mounted, updatePosition]);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const tooltipEl =
    typeof document !== 'undefined' &&
    mounted && (
      <span
        role="tooltip"
        className={`pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md bg-white px-3 py-2 text-sm font-medium text-black shadow-lg ring-1 ring-black/10 ${
          opacityVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, 0)',
          transition: `opacity ${FADE_MS}ms ease-out`,
        }}
      >
        {label}
      </span>
    );

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-flex ${className}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </span>
      {typeof document !== 'undefined' && createPortal(tooltipEl || null, document.body)}
    </>
  );
}
