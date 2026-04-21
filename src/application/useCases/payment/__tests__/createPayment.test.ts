import { describe, it, expect, vi, beforeEach } from "vitest";
import { md5Utf8HexUppercase } from "@/infrastructure/payment/robokassaHash";
import { paySignatureSource } from "@/domain/payment/robokassaSignature";
import { METHODOLOGY_CHECKOUT_DISABLED_RU } from "@/shared/constants/methodologyCheckout";

vi.mock("@/infrastructure/methodology/methodologyStoryblok", () => ({
  resolveMethodologyCheckoutAmountRub: vi.fn(),
}));

vi.mock("@/infrastructure/payment/persistence", () => ({
  createPendingPayment: vi.fn(),
  getOpenPendingPayment: vi.fn(),
  hasPurchaseForEmailAndProduct: vi.fn(),
  isPendingInvoiceReusable: vi.fn(
    (createdAt: string) => Date.now() - Date.parse(createdAt) <= 1000 * 60 * 60,
  ),
  isUniqueViolationError: vi.fn((error: unknown) => (error as { code?: string } | null)?.code === "23505"),
  markPendingPaymentExpired: vi.fn(),
  finalizeRobokassaResult: vi.fn(),
  recordPaymentCallback: vi.fn(),
}));

import { createMethodologyPayment } from "@/application/useCases/payment/createPayment";
import * as persistence from "@/infrastructure/payment/persistence";
import * as methodologyStoryblok from "@/infrastructure/methodology/methodologyStoryblok";

const mockedPersistence = vi.mocked(persistence);
const mockedResolveAmount = vi.mocked(methodologyStoryblok.resolveMethodologyCheckoutAmountRub);

const BASE_PARAMS = {
  robokassaLogin: "shop",
  robokassaPass1: "pass1",
  robokassaTest: false,
  payerEmail: "user@example.com",
  payerUserId: "user-1",
  publicSiteOrigin: "https://example.com",
};

describe("createMethodologyPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedResolveAmount.mockResolvedValue({ ok: true, amount: 1990 });
    mockedPersistence.hasPurchaseForEmailAndProduct.mockResolvedValue(false);
    mockedPersistence.getOpenPendingPayment.mockResolvedValue(null);
  });

  it("should reject unknown product before touching persistence", async () => {
    mockedResolveAmount.mockResolvedValueOnce({ ok: false, reason: "invalid_product" });
    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "unknown" });
    expect(result).toEqual({ ok: false, error: "Invalid product", httpStatus: 400 });
    expect(mockedPersistence.createPendingPayment).not.toHaveBeenCalled();
  });

  it("should reject checkout when Storyblok price is unavailable", async () => {
    mockedResolveAmount.mockResolvedValueOnce({ ok: false, reason: "checkout_unavailable" });
    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result).toEqual({
      ok: false,
      error: METHODOLOGY_CHECKOUT_DISABLED_RU,
      httpStatus: 503,
    });
    expect(mockedPersistence.createPendingPayment).not.toHaveBeenCalled();
  });

  it("should reject checkout when access already exists", async () => {
    mockedPersistence.hasPurchaseForEmailAndProduct.mockResolvedValueOnce(true);
    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result).toEqual({
      ok: false,
      error: "Доступ уже активирован для этого материала.",
      httpStatus: 409,
    });
    expect(mockedPersistence.getOpenPendingPayment).not.toHaveBeenCalled();
    expect(mockedPersistence.createPendingPayment).not.toHaveBeenCalled();
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
    expect(url.searchParams.get("SuccessURL")).toContain(`invId=${invId}`);
    expect(url.searchParams.get("IsTest")).toBeNull();
  });

  it("should reuse an existing open invoice for the same buyer and product", async () => {
    mockedPersistence.getOpenPendingPayment.mockResolvedValueOnce({
      inv_id: "42",
      email: "user@example.com",
      user_id: "user-1",
      product_id: "1",
      out_sum: 1990,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const url = new URL(result.redirectUrl);
    expect(url.searchParams.get("InvId")).toBe("42");
    expect(url.searchParams.get("OutSum")).toBe("1990.00");
    expect(mockedPersistence.createPendingPayment).not.toHaveBeenCalled();
    expect(mockedPersistence.markPendingPaymentExpired).not.toHaveBeenCalled();
  });

  it("should expire a stale pending invoice even when the amount matches", async () => {
    mockedPersistence.getOpenPendingPayment.mockResolvedValueOnce({
      inv_id: "stale-same-amount",
      email: "user@example.com",
      user_id: "user-1",
      product_id: "1",
      out_sum: 1990,
      status: "pending",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    });
    mockedPersistence.createPendingPayment.mockResolvedValueOnce(undefined);

    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result.ok).toBe(true);
    expect(mockedPersistence.markPendingPaymentExpired).toHaveBeenCalledWith({
      invId: "stale-same-amount",
      errorCode: "stale_pending_invoice",
      errorMessage: "Expired before checkout reuse because the pending invoice is too old.",
    });
    expect(mockedPersistence.createPendingPayment).toHaveBeenCalledOnce();
  });

  it("should expire a stale pending invoice when the amount no longer matches", async () => {
    mockedPersistence.getOpenPendingPayment.mockResolvedValueOnce({
      inv_id: "stale-1",
      email: "user@example.com",
      user_id: "user-1",
      product_id: "1",
      out_sum: 100,
      status: "pending",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    });
    mockedPersistence.createPendingPayment.mockResolvedValueOnce(undefined);

    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result.ok).toBe(true);
    expect(mockedPersistence.markPendingPaymentExpired).toHaveBeenCalledWith({
      invId: "stale-1",
      errorCode: "price_changed",
      errorMessage: "Expired before checkout reuse because the product price changed.",
    });
    expect(mockedPersistence.createPendingPayment).toHaveBeenCalledOnce();
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

  it("should reuse the existing pending invoice after a unique conflict", async () => {
    mockedPersistence.createPendingPayment.mockRejectedValueOnce({ code: "23505" });
    mockedPersistence.getOpenPendingPayment
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        inv_id: "88",
        email: "user@example.com",
        user_id: "user-1",
        product_id: "1",
        out_sum: 1990,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(new URL(result.redirectUrl).searchParams.get("InvId")).toBe("88");
  });

  it("should return error when persistence fails without a reusable invoice", async () => {
    mockedPersistence.createPendingPayment.mockRejectedValueOnce(new Error("db"));

    const result = await createMethodologyPayment({ ...BASE_PARAMS, productId: "1" });
    expect(result).toEqual({ ok: false, error: "Ошибка сохранения заказа", httpStatus: 500 });
  });
});
