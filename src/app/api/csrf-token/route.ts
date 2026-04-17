import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf_token";

export async function GET() {
  const token = crypto.randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: 60 * 30, // 30 minutes
  });

  return NextResponse.json({ token });
}
