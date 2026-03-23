"use client";

import { useCookieConsent } from "@/components/ui/CookieConsentContext";

const FOOTER_LEGAL_CLASS =
  "footer-legal-link text-xs md:text-sm min-[1200px]:text-base !px-3 !py-1.5 max-[500px]:!px-1.5 max-[500px]:!py-0.5 min-[1200px]:!px-5 min-[1200px]:!py-2.5";

export default function FooterCookieLink() {
  const consentRef = useCookieConsent();

  return (
    <button
      type="button"
      className={`${FOOTER_LEGAL_CLASS} cursor-pointer bg-transparent border-none font-inherit text-inherit`}
      onClick={() => consentRef?.current?.openPreferences?.()}
    >
      Настройки cookie
    </button>
  );
}
