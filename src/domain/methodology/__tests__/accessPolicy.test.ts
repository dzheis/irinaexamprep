import { describe, it, expect } from "vitest";
import { isMethodologyAdminEmail } from "@/domain/methodology/adminAccess";
import {
  canOpenPaymentModal,
  isModulePurchased,
} from "@/domain/methodology/methodologyPurchasePolicy";

describe("isMethodologyAdminEmail", () => {
  it("should match normalized admin email case-insensitively", () => {
    expect(isMethodologyAdminEmail("Admin@Example.com", "admin@example.com")).toBe(true);
  });

  it("should not grant access when admin email is empty", () => {
    expect(isMethodologyAdminEmail("admin@example.com", "")).toBe(false);
  });

  it("should reject non-admin email", () => {
    expect(isMethodologyAdminEmail("user@example.com", "admin@example.com")).toBe(false);
  });
});

describe("isModulePurchased", () => {
  it("should return true when module id is in list", () => {
    expect(isModulePurchased(["1", "2"], "1")).toBe(true);
  });

  it("should return false when module id is missing", () => {
    expect(isModulePurchased(["2"], "1")).toBe(false);
  });
});

describe("canOpenPaymentModal", () => {
  it("should block payment modal for already purchased module", () => {
    expect(
      canOpenPaymentModal({ isAuthed: true, purchasedModuleIds: ["1"], moduleId: "1" }),
    ).toBe(false);
  });

  it("should block payment modal for unauthenticated user", () => {
    expect(
      canOpenPaymentModal({ isAuthed: false, purchasedModuleIds: [], moduleId: "1" }),
    ).toBe(false);
  });

  it("should allow payment modal for authed user without purchase", () => {
    expect(
      canOpenPaymentModal({ isAuthed: true, purchasedModuleIds: [], moduleId: "1" }),
    ).toBe(true);
  });
});
