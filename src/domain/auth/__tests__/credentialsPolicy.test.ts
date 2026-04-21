import { describe, it, expect } from "vitest";
import {
  INVALID_EMAIL_MESSAGE,
  PASSWORD_MISMATCH_MESSAGE,
  SHORT_PASSWORD_MESSAGE,
  WEAK_NEW_PASSWORD_MESSAGE,
  isValidEmailFormat,
  validateNewPasswordPair,
  validateNewPasswordStrength,
  validateSignInCredentials,
  validateSignUpInput,
} from "@/domain/auth/credentialsPolicy";

/** Strong password satisfying the 12+ / digit / special rule. */
const STRONG_PASSWORD = "Secure-Pass-123";
const STRONG_PASSWORD_2 = "Another-Pass-456";

describe("isValidEmailFormat", () => {
  it("should accept standard email", () => {
    expect(isValidEmailFormat("user@example.com")).toBe(true);
  });

  it("should normalize whitespace and case before validation", () => {
    expect(isValidEmailFormat("  USER@Example.com  ")).toBe(true);
  });

  it("should reject email without @", () => {
    expect(isValidEmailFormat("userexample.com")).toBe(false);
  });

  it("should reject email without domain dot", () => {
    expect(isValidEmailFormat("user@example")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(isValidEmailFormat("")).toBe(false);
  });

  it("should reject email containing spaces inside", () => {
    expect(isValidEmailFormat("us er@example.com")).toBe(false);
  });
});

describe("validateSignInCredentials (backward-compatible, legacy floor = 6)", () => {
  it("should return null when email and password are valid", () => {
    expect(validateSignInCredentials("user@example.com", "secret1")).toBeNull();
  });

  it("should still accept legacy 6-char passwords so existing users keep signing in", () => {
    expect(validateSignInCredentials("user@example.com", "abcdef")).toBeNull();
  });

  it("should reject invalid email", () => {
    expect(validateSignInCredentials("bad", "secret1")).toBe(INVALID_EMAIL_MESSAGE);
  });

  it("should reject password shorter than legacy minimum length", () => {
    expect(validateSignInCredentials("user@example.com", "12345")).toBe(SHORT_PASSWORD_MESSAGE);
  });
});

describe("validateNewPasswordStrength", () => {
  it("should accept a strong password", () => {
    expect(validateNewPasswordStrength(STRONG_PASSWORD)).toBeNull();
  });

  it("should reject passwords shorter than 12", () => {
    expect(validateNewPasswordStrength("Short-1")).toBe(WEAK_NEW_PASSWORD_MESSAGE);
  });

  it("should reject passwords without a digit", () => {
    expect(validateNewPasswordStrength("NoDigits-HereNow")).toBe(WEAK_NEW_PASSWORD_MESSAGE);
  });

  it("should reject passwords without a special character", () => {
    expect(validateNewPasswordStrength("NoSpecials123ABC")).toBe(WEAK_NEW_PASSWORD_MESSAGE);
  });
});

describe("validateSignUpInput", () => {
  it("should accept matching strong credentials", () => {
    expect(
      validateSignUpInput({
        email: "user@example.com",
        password: STRONG_PASSWORD,
        confirmPassword: STRONG_PASSWORD,
      }),
    ).toEqual({ ok: true });
  });

  it("should flag email field when email invalid", () => {
    const r = validateSignUpInput({
      email: "bad",
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
    });
    expect(r).toEqual({ ok: false, field: "email", message: INVALID_EMAIL_MESSAGE });
  });

  it("should flag password field when password is weak", () => {
    const r = validateSignUpInput({
      email: "user@example.com",
      password: "weak",
      confirmPassword: "weak",
    });
    expect(r).toEqual({ ok: false, field: "password", message: WEAK_NEW_PASSWORD_MESSAGE });
  });

  it("should flag password field when passwords do not match", () => {
    const r = validateSignUpInput({
      email: "user@example.com",
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD_2,
    });
    expect(r).toEqual({ ok: false, field: "password", message: PASSWORD_MISMATCH_MESSAGE });
  });
});

describe("validateNewPasswordPair", () => {
  it("should accept two matching strong passwords", () => {
    expect(validateNewPasswordPair(STRONG_PASSWORD, STRONG_PASSWORD)).toEqual({ ok: true });
  });

  it("should reject passwords that fail the strength rules", () => {
    expect(validateNewPasswordPair("abcdef", "abcdef")).toEqual({
      ok: false,
      message: WEAK_NEW_PASSWORD_MESSAGE,
    });
  });

  it("should reject non-matching passwords", () => {
    expect(validateNewPasswordPair(STRONG_PASSWORD, STRONG_PASSWORD_2)).toEqual({
      ok: false,
      message: PASSWORD_MISMATCH_MESSAGE,
    });
  });
});
