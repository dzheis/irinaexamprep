"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(() => import("@/components/ui/CookieConsent"), {
  ssr: false,
});

export default function CookieConsentWrapper() {
  return <CookieConsent />;
}
