import { isValidEmailFormat } from "@/domain/auth/credentialsPolicy";

export function validateSubscribeRequest(
  rawEmail: unknown,
):
  | { ok: true; email: string }
  | { ok: false; error: string } {
  if (!rawEmail || typeof rawEmail !== "string") {
    return { ok: false, error: "Email обязателен" };
  }
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmailFormat(email)) {
    return { ok: false, error: "Некорректный email" };
  }
  return { ok: true, email };
}
