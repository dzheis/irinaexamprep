"use client";

import { useCallback, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Cloudflare Turnstile bot-protection widget.
 *
 * - Renders nothing when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is not configured, so dev
 *   environments without a site key keep working. Supabase only REQUIRES a token when
 *   CAPTCHA is enabled in its dashboard, so the server side is the enforcement point.
 * - Exposes an imperative `reset()` handle so callers can invalidate the current token
 *   after a failed submit (Turnstile tokens are single-use).
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: Record<string, unknown>,
      ) => string | undefined;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

export type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  className?: string;
  handleRef?: React.RefObject<TurnstileWidgetHandle | null>;
};

export function isTurnstileConfigured(): boolean {
  return !!process.env["NEXT_PUBLIC_TURNSTILE_SITE_KEY"]?.trim();
}

let scriptPromise: Promise<void> | null = null;

function ensureTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (window.turnstile) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("turnstile load")), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => reject(new Error("turnstile load")), { once: true });
    document.head.appendChild(s);
  }).catch((e) => {
    scriptPromise = null;
    throw e;
  });

  return scriptPromise;
}

export default function TurnstileWidget({
  onToken,
  onExpire,
  onError,
  theme = "auto",
  size = "flexible",
  className,
  handleRef,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTokenRef.current = onToken;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onToken, onExpire, onError]);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // widget may already be gone
      }
    }
  }, []);

  useImperativeHandle(handleRef, () => ({ reset }), [reset]);

  useEffect(() => {
    const siteKey = process.env["NEXT_PUBLIC_TURNSTILE_SITE_KEY"]?.trim();
    if (!siteKey) return;
    if (!containerRef.current) return;

    let cancelled = false;

    ensureTurnstileScript()
      .then(() => {
        if (cancelled) return;
        if (!window.turnstile || !containerRef.current) return;

        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onErrorRef.current?.(),
        });
        widgetIdRef.current = typeof id === "string" ? id : null;
      })
      .catch(() => {
        onErrorRef.current?.();
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
      widgetIdRef.current = null;
    };
  }, [theme, size]);

  if (!isTurnstileConfigured()) return null;

  return <div ref={containerRef} className={className ?? "flex justify-center"} />;
}
