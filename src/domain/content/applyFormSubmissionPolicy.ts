import { isValidEmailFormat } from "@/domain/auth/credentialsPolicy";
import { isApplyNameTextOnly } from "@/domain/content/applyApplicationPolicy";
import type { ApplyFormPayload } from "@/domain/content/applyFormPayload";

function readString(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return undefined;
}

export function validateApplyFormSubmission(body: unknown):
  | { ok: true; payload: ApplyFormPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Некорректное тело запроса" };
  }
  const b = body as Record<string, unknown>;

  const firstName = readString(b["firstName"]) ?? "";
  const lastName = readString(b["lastName"]) ?? "";
  const middleName = readString(b["middleName"]);
  const email = readString(b["email"]) ?? "";
  const telegram = readString(b["telegram"]);
  const instagram = readString(b["instagram"]);
  const whatsapp = readString(b["whatsapp"]);
  const courseTitle = readString(b["courseTitle"]);

  const rawCourseId = b["courseId"];
  const courseId =
    typeof rawCourseId === "number" && Number.isFinite(rawCourseId)
      ? rawCourseId
      : Number(rawCourseId);

  if (!firstName.trim() || !lastName.trim()) {
    return { ok: false, error: "Имя и фамилия обязательны" };
  }
  if (!isApplyNameTextOnly(firstName) || !isApplyNameTextOnly(lastName)) {
    return { ok: false, error: "Имя и фамилия должны содержать только текст" };
  }
  if (middleName?.trim() && !isApplyNameTextOnly(middleName)) {
    return { ok: false, error: "Отчество должно содержать только текст" };
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { ok: false, error: "Email обязателен" };
  }
  if (!isValidEmailFormat(trimmedEmail)) {
    return { ok: false, error: "Некорректный email" };
  }

  const payload: ApplyFormPayload = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: trimmedEmail,
    courseId: Number.isFinite(courseId) ? courseId : 0,
    ...(middleName?.trim() ? { middleName: middleName.trim() } : {}),
    ...(telegram?.trim() ? { telegram: telegram.trim() } : {}),
    ...(instagram?.trim() ? { instagram: instagram.trim() } : {}),
    ...(whatsapp?.trim() ? { whatsapp: whatsapp.trim() } : {}),
    ...(courseTitle?.trim() ? { courseTitle: courseTitle.trim() } : {}),
  };

  return { ok: true, payload };
}
