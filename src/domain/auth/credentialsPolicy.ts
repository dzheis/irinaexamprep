import { EMAIL_FORMAT_REGEX } from "@/domain/auth/emailPattern";

/**
 * Policy split on purpose:
 *   - `MIN_PASSWORD_LENGTH` (6) is the historical floor and is only used for sign-in,
 *     so pre-existing accounts with weaker passwords can still authenticate.
 *   - `MIN_NEW_PASSWORD_LENGTH` (12) plus complexity rules apply to every code path
 *     where a NEW password is chosen (sign-up and password reset).
 */
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NEW_PASSWORD_LENGTH = 12;

export const INVALID_EMAIL_MESSAGE = "Некорректный email";
export const SHORT_PASSWORD_MESSAGE = "Пароль должен быть не менее 6 символов";
export const WEAK_NEW_PASSWORD_MESSAGE =
  "Пароль должен быть не менее 12 символов и содержать цифру и специальный символ";
export const PASSWORD_MISMATCH_MESSAGE = "Пароли не совпадают";

const DIGIT_PATTERN = /\d/;
/** Matches any character that is not a letter, digit, or whitespace. */
const SPECIAL_CHAR_PATTERN = /[^\p{L}\p{N}\s]/u;

/** Single rule for “looks like an email” across app, subscribe, and forms. */
export function isValidEmailFormat(email: string): boolean {
  return EMAIL_FORMAT_REGEX.test(email.trim().toLowerCase());
}

/**
 * Strength check for a NEWLY chosen password (sign-up / password reset).
 * Returns `null` if the password passes; otherwise a user-facing message.
 */
export function validateNewPasswordStrength(password: string): string | null {
  if (password.length < MIN_NEW_PASSWORD_LENGTH) return WEAK_NEW_PASSWORD_MESSAGE;
  if (!DIGIT_PATTERN.test(password)) return WEAK_NEW_PASSWORD_MESSAGE;
  if (!SPECIAL_CHAR_PATTERN.test(password)) return WEAK_NEW_PASSWORD_MESSAGE;
  return null;
}

/** Sign-in check: lenient length only, for backward compatibility with legacy accounts. */
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
  const strength = validateNewPasswordStrength(params.password);
  if (strength) {
    return { ok: false, field: "password", message: strength };
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
  const strength = validateNewPasswordStrength(password);
  if (strength) {
    return { ok: false, message: strength };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: PASSWORD_MISMATCH_MESSAGE };
  }
  return { ok: true };
}
