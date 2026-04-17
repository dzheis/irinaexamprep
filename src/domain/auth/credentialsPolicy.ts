import { EMAIL_FORMAT_REGEX } from "@/domain/auth/emailPattern";

export const MIN_PASSWORD_LENGTH = 6;

export const INVALID_EMAIL_MESSAGE = "Некорректный email";
export const SHORT_PASSWORD_MESSAGE = "Пароль должен быть не менее 6 символов";
export const PASSWORD_MISMATCH_MESSAGE = "Пароли не совпадают";

/** Single rule for “looks like an email” across app, subscribe, and forms. */
export function isValidEmailFormat(email: string): boolean {
  return EMAIL_FORMAT_REGEX.test(email.trim().toLowerCase());
}

export function validateSignInCredentials(email: string, password: string): string | null {
  if (!isValidEmailFormat(email)) return INVALID_EMAIL_MESSAGE;
  if (password.length < MIN_PASSWORD_LENGTH) return SHORT_PASSWORD_MESSAGE;
  return null;
}

export function validateSignUpInput(params: {
  email: string;
  password: string;
  confirmPassword: string;
}):
  | { ok: true }
  | { ok: false; field: "email" | "password"; message: string } {
  if (!isValidEmailFormat(params.email)) {
    return { ok: false, field: "email", message: INVALID_EMAIL_MESSAGE };
  }
  if (params.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, field: "password", message: SHORT_PASSWORD_MESSAGE };
  }
  if (params.password !== params.confirmPassword) {
    return { ok: false, field: "password", message: PASSWORD_MISMATCH_MESSAGE };
  }
  return { ok: true };
}

export function validateNewPasswordPair(
  password: string,
  confirmPassword: string,
): { ok: true } | { ok: false; message: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: SHORT_PASSWORD_MESSAGE };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: PASSWORD_MISMATCH_MESSAGE };
  }
  return { ok: true };
}
