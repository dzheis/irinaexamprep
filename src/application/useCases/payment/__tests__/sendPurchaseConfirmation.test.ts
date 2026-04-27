import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/infrastructure/email/purchaseConfirmationEmail", () => ({
  sendPurchaseConfirmationEmail: vi.fn(),
}));

vi.mock("@/infrastructure/payment/persistence", () => ({
  claimPurchaseConfirmationEmail: vi.fn(),
  markPurchaseConfirmationEmailFailed: vi.fn(),
  markPurchaseConfirmationEmailSent: vi.fn(),
}));

import { sendPurchaseConfirmationForPayment } from "@/application/useCases/payment/sendPurchaseConfirmation";
import { sendPurchaseConfirmationEmail } from "@/infrastructure/email/purchaseConfirmationEmail";
import * as persistence from "@/infrastructure/payment/persistence";

const mockedPersistence = vi.mocked(persistence);
const mockedSendEmail = vi.mocked(sendPurchaseConfirmationEmail);

describe("sendPurchaseConfirmationForPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should skip when the payment has no claimable email job", async () => {
    mockedPersistence.claimPurchaseConfirmationEmail.mockResolvedValueOnce(null);

    await sendPurchaseConfirmationForPayment("42");

    expect(mockedSendEmail).not.toHaveBeenCalled();
    expect(mockedPersistence.markPurchaseConfirmationEmailSent).not.toHaveBeenCalled();
  });

  it("should send the confirmation email and mark it as sent", async () => {
    mockedPersistence.claimPurchaseConfirmationEmail.mockResolvedValueOnce({
      invId: "42",
      email: "buyer@example.com",
      productId: "1",
      outSum: 1990,
    });

    await sendPurchaseConfirmationForPayment("42");

    expect(mockedSendEmail).toHaveBeenCalledWith({
      email: "buyer@example.com",
      productId: "1",
      amountRub: 1990,
      invId: "42",
    });
    expect(mockedPersistence.markPurchaseConfirmationEmailSent).toHaveBeenCalledWith("42");
  });

  it("should release the claim and store an error when email sending fails", async () => {
    mockedPersistence.claimPurchaseConfirmationEmail.mockResolvedValueOnce({
      invId: "42",
      email: "buyer@example.com",
      productId: "1",
      outSum: 1990,
    });
    mockedSendEmail.mockRejectedValueOnce(new Error("smtp down"));

    await expect(sendPurchaseConfirmationForPayment("42")).rejects.toThrow("smtp down");

    expect(mockedPersistence.markPurchaseConfirmationEmailFailed).toHaveBeenCalledWith({
      invId: "42",
      errorMessage: "smtp down",
    });
  });
});
