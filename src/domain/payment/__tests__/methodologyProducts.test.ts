import { describe, it, expect } from "vitest";
import { getMethodologyProductPriceRub } from "@/domain/payment/methodologyProducts";

describe("getMethodologyProductPriceRub", () => {
  it("should return configured price for known product id", () => {
    expect(getMethodologyProductPriceRub("1")).toBe(1990);
  });

  it("should trim whitespace around product id", () => {
    expect(getMethodologyProductPriceRub("  1  ")).toBe(1990);
  });

  it("should return undefined for unknown product id", () => {
    expect(getMethodologyProductPriceRub("unknown")).toBeUndefined();
  });

  it("should return undefined for empty product id", () => {
    expect(getMethodologyProductPriceRub("")).toBeUndefined();
  });
});
