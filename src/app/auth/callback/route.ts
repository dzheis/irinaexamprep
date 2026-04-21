import { NextRequest, NextResponse } from "next/server";
import { completeAuthCodeExchange } from "@/application/useCases/auth/completeAuthCallback";
import { ROUTES } from "@/shared/constants/routes";

/**
 * Accept only same-origin relative paths for post-auth redirects.
 * Rejects absolute URLs (`https://evil.com`) and protocol-relative paths (`//evil.com`)
 * that `new URL(next, req.url)` would otherwise turn into an open redirect.
 */
function safeNext(raw: string | null): string {
  if (!raw) return ROUTES.methodology;
  if (!raw.startsWith("/")) return ROUTES.methodology;
  if (raw.startsWith("//")) return ROUTES.methodology;
  return raw;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const next = safeNext(searchParams.get("next"));
  await completeAuthCodeExchange(searchParams.get("code"));
  return NextResponse.redirect(new URL(next, req.url));
}
