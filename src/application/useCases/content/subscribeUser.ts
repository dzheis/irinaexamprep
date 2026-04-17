import { validateSubscribeRequest } from "@/domain/subscribe/subscribeRequestPolicy";
import { sendSubscribeNotificationEmails } from "@/infrastructure/email/subscribeNotifications";

export type SubscribeUserResult =
  | { ok: true }
  | { ok: false; error: string; httpStatus?: number };

export async function subscribeUser(rawEmail: unknown): Promise<SubscribeUserResult> {
  if (!process.env["EMAIL_USER"] || !process.env["EMAIL_PASS"]) {
    return { ok: false, error: "Сервис подписки временно недоступен.", httpStatus: 503 };
  }

  const v = validateSubscribeRequest(rawEmail);
  if (!v.ok) {
    return { ok: false, error: v.error, httpStatus: 400 };
  }

  await sendSubscribeNotificationEmails(v.email);

  return { ok: true };
}
