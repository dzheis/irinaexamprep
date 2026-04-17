import { describe, it, expect } from "vitest";
import {
  parsePaymentAmount,
  paymentAmountsMatchWithinTolerance,
} from "@/domain/payment/paymentAmount";

describe("parsePaymentAmount", () => {
  it("should parse plain number string", () => {
    expect(parsePaymentAmount("1990.00")).toBe(1990);
  });

  it("should accept comma as decimal separator", () => {
    expect(parsePaymentAmount("1990,50")).toBe(1990.5);
  });

  it("should ignore internal whitespace", () => {
    expect(parsePaymentAmount("1 990,50")).toBe(1990.5);
  });

  it("should return NaN for non-numeric", () => {
    expect(Number.isNaN(parsePaymentAmount("abc"))).toBe(true);
  });
});

describe("paymentAmountsMatchWithinTolerance", () => {
  it("should accept exact match", () => {
    expect(paymentAmountsMatchWithinTolerance(1990, 1990)).toBe(true);
  });

  it("should accept difference within default tolerance (0.01)", () => {
    expect(paymentAmountsMatchWithinTolerance(1990.0, 1990.005)).toBe(true);
  });

  it("should reject difference above default tolerance", () => {
    expect(paymentAmountsMatchWithinTolerance(1990, 1990.5)).toBe(false);
  });

  it("should reject when either value is NaN", () => {
    expect(paymentAmountsMatchWithinTolerance(NaN, 1990)).toBe(false);
    expect(paymentAmountsMatchWithinTolerance(1990, NaN)).toBe(false);
  });
});
