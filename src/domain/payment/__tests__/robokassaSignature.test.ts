import { describe, it, expect } from "vitest";
import {
  normalizeRobokassaSignatureHex,
  paySignatureSource,
  resultSignatureSource,
} from "@/domain/payment/robokassaSignature";

describe("paySignatureSource", () => {
  it("should join fields in Robokassa pay order", () => {
    expect(paySignatureSource("login", "1990.00", "42", "pass1")).toBe("login:1990.00:42:pass1");
  });
});

describe("resultSignatureSource", () => {
  it("should join fields in Robokassa result order", () => {
    expect(resultSignatureSource("1990.00", "42", "pass2")).toBe("1990.00:42:pass2");
  });
});

describe("normalizeRobokassaSignatureHex", () => {
  it("should trim and uppercase", () => {
    expect(normalizeRobokassaSignatureHex("  abc123  ")).toBe("ABC123");
  });
});
