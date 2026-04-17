import {
  INVALID_EMAIL_MESSAGE,
  isValidEmailFormat,
  validateNewPasswordPair,
} from "@/domain/auth/credentialsPolicy";

/** Shared email check for forgot-password, payment preflight, etc. */
export function validatePlainEmail(trimmedEmail: string): string | null {
  if (!isValidEmailFormat(trimmedEmail)) return INVALID_EMAIL_MESSAGE;
  return null;
}

export function validatePasswordResetForm(password: string, confirmPassword: string) {
  return validateNewPasswordPair(password, confirmPassword);
}
