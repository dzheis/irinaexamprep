import { describe, it, expect, vi, beforeEach } from "vitest";
import { md5Utf8HexUppercase } from "@/infrastructure/payment/robokassaHash";
import { resultSignatureSource } from "@/domain/payment/robokassaSignature";

vi.mock("@/infrastructure/payment/persistence", () => ({
  getPendingPayment: vi.fn(),
  upsertPurchaseAndDeletePending: vi.fn(),
  createPendingPayment: vi.fn(),
}));

import { verifyRobokassaPaymentResult } from "@/application/useCases/payment/verifyPayment";
import * as persistence from "@/infrastructure/payment/persistence";

const mockedPersistence = vi.mocked(persistence);

const PASS2 = "test-pass-2";
const INV_ID = "42";
const OUT_SUM = "1990.00";

function buildValidSignature(outSum: string, invId: string, pass2: string): string {
  return md5Utf8HexUppercase(resultSignatureSource(outSum, invId, pass2));
}

describe("verifyRobokassaPaymentResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return ERROR when any field is missing", async () => {
    expect(
      await verifyRobokassaPaymentResult({ outSum: "", invId: INV_ID, signatureValue: "x", pass2: PASS2 }),
    ).toBe("ERROR");
    expect(
      await verifyRobokassaPaymentResult({ outSum: OUT_SUM, invId: "", signatureValue: "x", pass2: PASS2 }),
    ).toBe("ERROR");
    expect(
      await verifyRobokassaPaymentResult({ outSum: OUT_SUM, invId: INV_ID, signatureValue: "", pass2: PASS2 }),
    ).toBe("ERROR");
  });

  it("should reject invalid signature without touching persistence", async () => {
    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: "INVALID",
      pass2: PASS2,
    });
    expect(result).toBe("ERROR");
    expect(mockedPersistence.getPendingPayment).not.toHaveBeenCalled();
    expect(mockedPersistence.upsertPurchaseAndDeletePending).not.toHaveBeenCalled();
  });

  it("should upsert purchase on valid signature and matching amount", async () => {
    mockedPersistence.getPendingPayment.mockResolvedValueOnce({
      email: "user@example.com",
      product_id: "1",
      out_sum: 1990,
    });
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2);

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
    });

    expect(result).toBe(`OK${INV_ID}`);
    expect(mockedPersistence.upsertPurchaseAndDeletePending).toHaveBeenCalledWith({
      invId: INV_ID,
      email: "user@example.com",
      productId: "1",
    });
  });

  it("should NOT upsert purchase on amount mismatch (but still return OK per gateway contract)", async () => {
    mockedPersistence.getPendingPayment.mockResolvedValueOnce({
      email: "user@example.com",
      product_id: "1",
      out_sum: 100,
    });
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2);

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
    });

    expect(result).toBe(`OK${INV_ID}`);
    expect(mockedPersistence.upsertPurchaseAndDeletePending).not.toHaveBeenCalled();
  });

  it("should accept lowercase signature (normalization)", async () => {
    mockedPersistence.getPendingPayment.mockResolvedValueOnce({
      email: "user@example.com",
      product_id: "1",
      out_sum: 1990,
    });
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2).toLowerCase();

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
    });

    expect(result).toBe(`OK${INV_ID}`);
    expect(mockedPersistence.upsertPurchaseAndDeletePending).toHaveBeenCalledOnce();
  });
});
