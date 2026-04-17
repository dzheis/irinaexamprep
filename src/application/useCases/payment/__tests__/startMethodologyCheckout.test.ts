import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/infrastructure/auth/supabaseSession", () => ({
  getAuthenticatedUserEmail: vi.fn(),
  signOutServerSession: vi.fn(),
  exchangeAuthCodeForSession: vi.fn(),
}));

vi.mock("@/infrastructure/payment/persistence", () => ({
  createPendingPayment: vi.fn(),
  getPendingPayment: vi.fn(),
  upsertPurchaseAndDeletePending: vi.fn(),
}));

import { startMethodologyCheckout } from "@/application/useCases/payment/startMethodologyCheckout";
import * as session from "@/infrastructure/auth/supabaseSession";
import * as persistence from "@/infrastructure/payment/persistence";

const mockedSession = vi.mocked(session);
const mockedPersistence = vi.mocked(persistence);

const originalEnv = { ...process.env };

describe("startMethodologyCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env["ROBOKASSA_LOGIN"] = "shop";
    process.env["ROBOKASSA_PASS1"] = "pass1";
    delete process.env["ROBOKASSA_TEST"];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should return 503 when Robokassa env is missing", async () => {
    delete process.env["ROBOKASSA_LOGIN"];
    const result = await startMethodologyCheckout({
      productId: "1",
      publicSiteOrigin: "https://example.com",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.httpStatus).toBe(503);
  });

  it("should return 401 when user is not authenticated", async () => {
    mockedSession.getAuthenticatedUserEmail.mockResolvedValueOnce(null);

    const result = await startMethodologyCheckout({
      productId: "1",
      publicSiteOrigin: "https://example.com",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.httpStatus).toBe(401);
  });

  it("should return 400 for invalid product", async () => {
    mockedSession.getAuthenticatedUserEmail.mockResolvedValueOnce("user@example.com");

    const result = await startMethodologyCheckout({
      productId: "unknown",
      publicSiteOrigin: "https://example.com",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.httpStatus).toBe(400);
    expect(mockedPersistence.createPendingPayment).not.toHaveBeenCalled();
  });

  it("should succeed and return Robokassa redirectUrl for authed user and valid product", async () => {
    mockedSession.getAuthenticatedUserEmail.mockResolvedValueOnce("user@example.com");
    mockedPersistence.createPendingPayment.mockResolvedValueOnce(undefined);

    const result = await startMethodologyCheckout({
      productId: "1",
      publicSiteOrigin: "https://example.com",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.redirectUrl).toContain("auth.robokassa.ru");
    }
  });
});
