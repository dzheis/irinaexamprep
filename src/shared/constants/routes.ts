/**
 * Canonical app paths for links, redirects, and cache revalidation.
 * Shared by application + presentation (no upward dependency on presentation).
 */
export const ROUTES = {
  home: "/",
  courses: "/courses",
  methodology: "/methodology",
  freeResources: "/free-resources",
  offer: "/offer",
  privacy: "/privacy",
  paymentRefund: "/payment-refund",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
} as const;

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** Home page anchors (same-origin hash navigation). */
export const HOME_HASH = {
  about: `${ROUTES.home}#about`,
  cta: `${ROUTES.home}#cta`,
} as const;

/** Sitemap static segments: first entry is "" so the root URL has no duplicate slash. */
export const SITEMAP_STATIC_PATHS = [
  "",
  ROUTES.courses,
  ROUTES.methodology,
  ROUTES.freeResources,
  ROUTES.offer,
  ROUTES.privacy,
  ROUTES.paymentRefund,
] as const;
