import { validateApplyFormSubmission } from "@/domain/content/applyFormSubmissionPolicy";
import { sendApplyFormEmails } from "@/infrastructure/email/applyNotifications";

export type { ApplyFormInput } from "@/types/applyForm";

export type SubmitApplyFormResult =
  | { ok: true }
  | { ok: false; error: string; httpStatus?: number };

export async function submitApplyForm(body: unknown): Promise<SubmitApplyFormResult> {
  if (!process.env["EMAIL_USER"] || !process.env["EMAIL_PASS"]) {
    return { ok: false, error: "Сервис заявок временно недоступен.", httpStatus: 503 };
  }

  const v = validateApplyFormSubmission(body);
  if (!v.ok) {
    return { ok: false, error: v.error, httpStatus: 400 };
  }

  await sendApplyFormEmails(v.payload);

  return { ok: true };
}
