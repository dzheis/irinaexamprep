import { describe, it, expect, vi, beforeEach } from "vitest";
import { md5Utf8HexUppercase } from "@/infrastructure/payment/robokassaHash";
import { resultSignatureSource } from "@/domain/payment/robokassaSignature";

vi.mock("@/infrastructure/payment/persistence", () => ({
  createPendingPayment: vi.fn(),
  getOpenPendingPayment: vi.fn(),
  hasPurchaseForEmailAndProduct: vi.fn(),
  isUniqueViolationError: vi.fn((error: unknown) => (error as { code?: string } | null)?.code === "23505"),
  markPendingPaymentExpired: vi.fn(),
  finalizeRobokassaResult: vi.fn(),
  recordPaymentCallback: vi.fn(),
}));

vi.mock("@/application/useCases/payment/sendPurchaseConfirmation", () => ({
  sendPurchaseConfirmationForPayment: vi.fn(),
}));

import { verifyRobokassaPaymentResult } from "@/application/useCases/payment/verifyPayment";
import { sendPurchaseConfirmationForPayment } from "@/application/useCases/payment/sendPurchaseConfirmation";
import * as persistence from "@/infrastructure/payment/persistence";

const mockedPersistence = vi.mocked(persistence);
const mockedSendPurchaseConfirmation = vi.mocked(sendPurchaseConfirmationForPayment);

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
      await verifyRobokassaPaymentResult({
        outSum: "",
        invId: INV_ID,
        signatureValue: "x",
        pass2: PASS2,
        payload: {},
        headers: {},
        httpMethod: "POST",
        sourceIp: null,
      }),
    ).toBe("ERROR");
    expect(
      await verifyRobokassaPaymentResult({
        outSum: OUT_SUM,
        invId: "",
        signatureValue: "x",
        pass2: PASS2,
        payload: {},
        headers: {},
        httpMethod: "POST",
        sourceIp: null,
      }),
    ).toBe("ERROR");
    expect(
      await verifyRobokassaPaymentResult({
        outSum: OUT_SUM,
        invId: INV_ID,
        signatureValue: "",
        pass2: PASS2,
        payload: {},
        headers: {},
        httpMethod: "POST",
        sourceIp: null,
      }),
    ).toBe("ERROR");
    expect(mockedPersistence.recordPaymentCallback).toHaveBeenCalled();
  });

  it("should reject invalid signature without touching persistence", async () => {
    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: "INVALID",
      pass2: PASS2,
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: "INVALID" },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });
    expect(result).toBe("ERROR");
    expect(mockedPersistence.finalizeRobokassaResult).not.toHaveBeenCalled();
    expect(mockedPersistence.recordPaymentCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        invId: INV_ID,
        processingOutcome: "invalid_signature",
        signatureValid: false,
      }),
    );
  });

  it("should reject invalid amount before signature verification", async () => {
    const result = await verifyRobokassaPaymentResult({
      outSum: "not-a-number",
      invId: INV_ID,
      signatureValue: "INVALID",
      pass2: PASS2,
      payload: { OutSum: "not-a-number", InvId: INV_ID, SignatureValue: "INVALID" },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });
    expect(result).toBe("ERROR");
    expect(mockedPersistence.finalizeRobokassaResult).not.toHaveBeenCalled();
    expect(mockedPersistence.recordPaymentCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        processingOutcome: "invalid_out_sum",
      }),
    );
  });

  it("should return OK when atomic finalization completes successfully", async () => {
    mockedPersistence.finalizeRobokassaResult.mockResolvedValueOnce({
      acknowledgement: "ok",
      processingOutcome: "completed",
    });
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2);

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: signature },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });

    expect(result).toBe(`OK${INV_ID}`);
    expect(mockedPersistence.finalizeRobokassaResult).toHaveBeenCalledWith({
      invId: INV_ID,
      outSum: OUT_SUM,
      signatureValue: signature,
      httpMethod: "POST",
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: signature },
      headers: {},
      sourceIp: null,
    });
    expect(mockedSendPurchaseConfirmation).toHaveBeenCalledWith(INV_ID);
  });

  it("should return OK for an already completed duplicate callback", async () => {
    mockedPersistence.finalizeRobokassaResult.mockResolvedValueOnce({
      acknowledgement: "ok",
      processingOutcome: "duplicate_ok",
    });
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2);

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: signature },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });

    expect(result).toBe(`OK${INV_ID}`);
    expect(mockedSendPurchaseConfirmation).toHaveBeenCalledWith(INV_ID);
  });

  it("should return ERROR when atomic finalization rejects the callback", async () => {
    mockedPersistence.finalizeRobokassaResult.mockResolvedValueOnce({
      acknowledgement: "error",
      processingOutcome: "missing_invoice",
    });
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2);

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: signature },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });

    expect(result).toBe("ERROR");
    expect(mockedSendPurchaseConfirmation).not.toHaveBeenCalled();
  });

  it("should accept lowercase signature (normalization)", async () => {
    mockedPersistence.finalizeRobokassaResult.mockResolvedValueOnce({
      acknowledgement: "ok",
      processingOutcome: "completed",
    });
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2).toLowerCase();

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: signature },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });

    expect(result).toBe(`OK${INV_ID}`);
    expect(mockedPersistence.finalizeRobokassaResult).toHaveBeenCalledOnce();
    expect(mockedSendPurchaseConfirmation).toHaveBeenCalledWith(INV_ID);
  });

  it("should still acknowledge Robokassa when confirmation email delivery fails", async () => {
    mockedPersistence.finalizeRobokassaResult.mockResolvedValueOnce({
      acknowledgement: "ok",
      processingOutcome: "completed",
    });
    mockedSendPurchaseConfirmation.mockRejectedValueOnce(new Error("smtp down"));
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2);

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: signature },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });

    expect(result).toBe(`OK${INV_ID}`);
    expect(mockedSendPurchaseConfirmation).toHaveBeenCalledWith(INV_ID);
  });

  it("should return ERROR and log when finalization throws", async () => {
    mockedPersistence.finalizeRobokassaResult.mockRejectedValueOnce(new Error("db down"));
    const signature = buildValidSignature(OUT_SUM, INV_ID, PASS2);

    const result = await verifyRobokassaPaymentResult({
      outSum: OUT_SUM,
      invId: INV_ID,
      signatureValue: signature,
      pass2: PASS2,
      payload: { OutSum: OUT_SUM, InvId: INV_ID, SignatureValue: signature },
      headers: {},
      httpMethod: "POST",
      sourceIp: null,
    });

    expect(result).toBe("ERROR");
    expect(mockedPersistence.recordPaymentCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        invId: INV_ID,
        processingOutcome: "finalization_exception",
        signatureValid: true,
      }),
    );
  });
});
