export const COOKIE_CONSENT_STORAGE_KEY = "cookie-consent";

export type CookieCategory = "necessary" | "analytics" | "marketing" | "functional";

export type CookieConsentState = {
  choiceMade: boolean;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

const DEFAULT_CONSENT: CookieConsentState = {
  choiceMade: false,
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export function getStoredConsent(): CookieConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    return {
      choiceMade: Boolean(parsed.choiceMade),
      necessary: parsed.necessary !== false,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      functional: Boolean(parsed.functional),
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveConsent(state: CookieConsentState): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function hasConsentChoice(): boolean {
  return getStoredConsent().choiceMade;
}

export function isCategoryAllowed(category: CookieCategory): boolean {
  const s = getStoredConsent();
  if (category === "necessary") return true;
  if (category === "analytics") return s.analytics;
  if (category === "marketing") return s.marketing;
  if (category === "functional") return s.functional;
  return false;
}
