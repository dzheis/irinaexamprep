import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/infrastructure/auth/supabasePasswordAuth", () => ({
  signInWithEmailPassword: vi.fn(),
}));

import { signIn } from "@/application/useCases/auth/signIn";
import * as passwordAuth from "@/infrastructure/auth/supabasePasswordAuth";

const mocked = vi.mocked(passwordAuth);

describe("signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject invalid email before calling infrastructure", async () => {
    const result = await signIn("bad-email", "secret1");
    expect(result.error).toBe("Некорректный email");
    expect(mocked.signInWithEmailPassword).not.toHaveBeenCalled();
  });

  it("should reject short password before calling infrastructure", async () => {
    const result = await signIn("user@example.com", "123");
    expect(result.error).toBe("Пароль должен быть не менее 6 символов");
    expect(mocked.signInWithEmailPassword).not.toHaveBeenCalled();
  });

  it("should return null error on successful sign in", async () => {
    mocked.signInWithEmailPassword.mockResolvedValueOnce({ ok: true });
    const result = await signIn("user@example.com", "secret1");
    expect(result).toEqual({ error: null });
  });

  it("should map invalid_credentials to localized message", async () => {
    mocked.signInWithEmailPassword.mockResolvedValueOnce({
      ok: false,
      reason: "invalid_credentials",
      message: "Invalid login credentials",
    });
    const result = await signIn("user@example.com", "secret1");
    expect(result.error).toBe("Неверный email или пароль");
  });

  it("should map email_not_confirmed to localized message", async () => {
    mocked.signInWithEmailPassword.mockResolvedValueOnce({
      ok: false,
      reason: "email_not_confirmed",
      message: "Email not confirmed",
    });
    const result = await signIn("user@example.com", "secret1");
    expect(result.error).toBe("Подтвердите email по ссылке из письма");
  });

  it("should return generic error when infrastructure throws", async () => {
    mocked.signInWithEmailPassword.mockRejectedValueOnce(new Error("network"));
    const result = await signIn("user@example.com", "secret1");
    expect(result.error).toBe("Ошибка входа. Попробуйте позже.");
  });
});
