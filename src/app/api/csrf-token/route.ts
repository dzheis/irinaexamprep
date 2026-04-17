import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateCsrfToken } from "@/infrastructure/security/csrfToken";

const CSRF_COOKIE_NAME = "csrf_token";

export async function GET() {
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
