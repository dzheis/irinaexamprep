import { describe, it, expect } from "vitest";
import { validateSubscribeRequest } from "@/domain/subscribe/subscribeRequestPolicy";

describe("validateSubscribeRequest", () => {
  it("should reject non-string input", () => {
    expect(validateSubscribeRequest(undefined).ok).toBe(false);
    expect(validateSubscribeRequest(123).ok).toBe(false);
    expect(validateSubscribeRequest({}).ok).toBe(false);
  });

  it("should reject invalid email", () => {
    expect(validateSubscribeRequest("bad").ok).toBe(false);
  });

  it("should accept and normalize valid email", () => {
    const r = validateSubscribeRequest("  USER@Example.com  ");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.email).toBe("user@example.com");
  });
});
