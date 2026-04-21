import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateCsrfToken } from "@/infrastructure/security/csrfToken";
import { clientIp, csrfLimiter } from "@/infrastructure/security/rateLimit";

const CSRF_COOKIE_NAME = "csrf_token";

export async function GET(req: Request) {
  const rate = await csrfLimiter.limit(`csrf:${clientIp(req)}`);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = generateCsrfToken();

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: 60 * 30,
  });

  return NextResponse.json({ token });
}
