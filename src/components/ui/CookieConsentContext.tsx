"use client";

import { createContext, useContext, useRef, ReactNode } from "react";
import dynamic from "next/dynamic";
import type { CookieConsentRef } from "./CookieConsent";

const CookieConsent = dynamic(() => import("@/components/ui/CookieConsent"), { ssr: false });
const CookieConsentWithRef = CookieConsent as unknown as React.ForwardRefExoticComponent<
  Record<string, never>
>;

const CookieConsentContext = createContext<React.RefObject<CookieConsentRef | null> | null>(null);

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

type CookieConsentProviderProps = { children: ReactNode };

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const consentRef = useRef<CookieConsentRef | null>(null);

  return (
    <CookieConsentContext.Provider value={consentRef}>
      {children}
      <CookieConsentWithRef ref={consentRef as never} />
    </CookieConsentContext.Provider>
  );
}
