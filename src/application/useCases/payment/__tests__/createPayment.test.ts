import { describe, it, expect, vi, beforeEach } from "vitest";
import { md5Utf8HexUppercase } from "@/infrastructure/payment/robokassaHash";
import { paySignatureSource } from "@/domain/payment/robokassaSignature";

vi.mock("@/infrastructure/payment/persistence", () => ({
  createPendingPayment: vi.fn(),
  getPendingPayment: vi.fn(),
  upsertPurchaseAndDeletePending: vi.fn(),
}));

import { createMethodologyPayment } from "@/application/useCases/payment/createPayment";
import * as persistence from "@/infrastructure/payment/persistence";

const mockedPersistence = vi.mocked(persistence);

const BASE_PARAMS = {
  robokassaLogin: "shop",
  robokassaPass1: "pass1",
  robokassaTest: false,
  payerEmail: "user@example.com",
  publicSiteOrigin: "https://example.com",
};

describe("createMethodologyPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unknown product before touching persistence", async () => {
    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "unknown" });
    expect(result).toEqual({ ok: false, error: "Invalid product" });
    expect(mockedPersistence.createPendingPayment).not.toHaveBeenCalled();
  });

  it("should return error when persistence fails", async () => {
    mockedPersistence.createPendingPayment.mockRejectedValueOnce(new Error("db"));
    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result).toEqual({ ok: false, error: "Ошибка сохранения заказа" });
  });

  it("should produce redirect URL with a signature matching MD5(login:outSum:invId:pass1)", async () => {
    mockedPersistence.createPendingPayment.mockResolvedValueOnce(undefined);

    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const url = new URL(result.redirectUrl);
    expect(url.host).toBe("auth.robokassa.ru");

    const outSum = url.searchParams.get("OutSum");
    const invId = url.searchParams.get("InvId");
    const signature = url.searchParams.get("SignatureValue");
    expect(outSum).toBe("1990.00");
    expect(invId).toBeTruthy();
    expect(signature).toBe(
      md5Utf8HexUppercase(paySignatureSource("shop", outSum!, invId!, "pass1")),
    );
    expect(url.searchParams.get("SuccessURL")).toContain("https://example.com");
    expect(url.searchParams.get("IsTest")).toBeNull();
  });

  it("should pass IsTest=1 when test mode is enabled", async () => {
    mockedPersistence.createPendingPayment.mockResolvedValueOnce(undefined);

    const result = await createMethodologyPayment({
      ...BASE_PARAMS,
      productId: "1",
      robokassaTest: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(new URL(result.redirectUrl).searchParams.get("IsTest")).toBe("1");
  });
});
