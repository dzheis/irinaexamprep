import { sendPurchaseConfirmationEmail } from "@/infrastructure/email/purchaseConfirmationEmail";
import {
  claimPurchaseConfirmationEmail,
  markPurchaseConfirmationEmailFailed,
  markPurchaseConfirmationEmailSent,
} from "@/infrastructure/payment/persistence";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown email delivery error";
}

export async function sendPurchaseConfirmationForPayment(invId: string): Promise<void> {
  const claim = await claimPurchaseConfirmationEmail(invId);
  if (!claim) return;

  try {
    await sendPurchaseConfirmationEmail({
      email: claim.email,
      productId: claim.productId,
      amountRub: claim.outSum,
      invId: claim.invId,
    });
    await markPurchaseConfirmationEmailSent(claim.invId);
  } catch (error) {
    await markPurchaseConfirmationEmailFailed({
      invId: claim.invId,
      errorMessage: errorMessage(error),
    });
    throw error;
  }
}
