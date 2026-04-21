import { type NextRequest } from "next/server";
import { updateSession } from "@/infrastructure/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/**
 * Run Supabase session refresh ONLY where it's needed.
 *
 * Skip list (public or self-authenticating API routes, each saves ~150-200ms per request
 * because it avoids a duplicate network round-trip to Supabase auth):
 *   - `/api/csrf-token`            — anonymous
 *   - `/api/subscribe`, `/api/apply` — anonymous forms
 *   - `/api/revalidate`             — Storyblok webhook, secret-based
 *   - `/api/pay/result`             — Robokassa callback, must stay completely public
 *
 * Everything else (HTML pages, `/api/pay`, `/api/auth/*`, `/api/my-purchases`, etc.)
 * keeps the session-refresh middleware.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/csrf-token|api/subscribe|api/apply|api/revalidate|api/pay/result|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
