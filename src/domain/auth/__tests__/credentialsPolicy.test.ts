import { describe, it, expect } from "vitest";
import {
  INVALID_EMAIL_MESSAGE,
  PASSWORD_MISMATCH_MESSAGE,
  SHORT_PASSWORD_MESSAGE,
  isValidEmailFormat,
  validateNewPasswordPair,
  validateSignInCredentials,
  validateSignUpInput,
} from "@/domain/auth/credentialsPolicy";

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

describe("validateSignInCredentials", () => {
  it("should return null when email and password are valid", () => {
    expect(validateSignInCredentials("user@example.com", "secret1")).toBeNull();
  });

  it("should reject invalid email", () => {
    expect(validateSignInCredentials("bad", "secret1")).toBe(INVALID_EMAIL_MESSAGE);
  });

  it("should reject password shorter than minimum length", () => {
    expect(validateSignInCredentials("user@example.com", "12345")).toBe(SHORT_PASSWORD_MESSAGE);
  });
});

describe("validateSignUpInput", () => {
  it("should accept matching credentials", () => {
    expect(
      validateSignUpInput({
        email: "user@example.com",
        password: "secret1",
        confirmPassword: "secret1",
      }),
    ).toEqual({ ok: true });
  });

  it("should flag email field when email invalid", () => {
    const r = validateSignUpInput({
      email: "bad",
      password: "secret1",
      confirmPassword: "secret1",
    });
    expect(r).toEqual({ ok: false, field: "email", message: INVALID_EMAIL_MESSAGE });
  });

  it("should flag password field when password too short", () => {
    const r = validateSignUpInput({
      email: "user@example.com",
      password: "123",
      confirmPassword: "123",
    });
    expect(r).toEqual({ ok: false, field: "password", message: SHORT_PASSWORD_MESSAGE });
  });

  it("should flag password field when passwords do not match", () => {
    const r = validateSignUpInput({
      email: "user@example.com",
      password: "secret1",
      confirmPassword: "secret2",
    });
    expect(r).toEqual({ ok: false, field: "password", message: PASSWORD_MISMATCH_MESSAGE });
  });
});

describe("validateNewPasswordPair", () => {
  it("should accept two matching passwords of sufficient length", () => {
    expect(validateNewPasswordPair("abcdef", "abcdef")).toEqual({ ok: true });
  });

  it("should reject password shorter than minimum", () => {
    expect(validateNewPasswordPair("abc", "abc")).toEqual({
      ok: false,
      message: SHORT_PASSWORD_MESSAGE,
    });
  });

  it("should reject non-matching passwords", () => {
    expect(validateNewPasswordPair("abcdef", "abcdeg")).toEqual({
      ok: false,
      message: PASSWORD_MISMATCH_MESSAGE,
    });
  });
});
