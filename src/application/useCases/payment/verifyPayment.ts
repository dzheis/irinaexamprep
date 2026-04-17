import {
  paymentAmountsMatchWithinTolerance,
  parsePaymentAmount,
} from "@/domain/payment/paymentAmount";
import {
  normalizeRobokassaSignatureHex,
  resultSignatureSource,
} from "@/domain/payment/robokassaSignature";
import { md5Utf8HexUppercase } from "@/infrastructure/payment/robokassaHash";
import {
  getPendingPayment,
  upsertPurchaseAndDeletePending,
} from "@/services/paymentService";

function checkResultSignature(
  outSum: string,
  invId: string,
  signatureValue: string,
  pass2: string,
): boolean {
  const expected = md5Utf8HexUppercase(resultSignatureSource(outSum, invId, pass2));
  return expected === normalizeRobokassaSignatureHex(signatureValue);
}

export type VerifyRobokassaResultBody = string;

/**
 * Robokassa Result URL: validate signature, reconcile amount, record purchase.
 * On valid signature, response body is always OK{InvId} (per gateway contract), including when DB write fails.
 */
export async function verifyRobokassaPaymentResult(params: {
  outSum: string;
  invId: string;
  signatureValue: string;
  pass2: string;
}): Promise<VerifyRobokassaResultBody> {
  const { outSum, invId, signatureValue, pass2 } = params;
  if (!outSum || !invId || !signatureValue) {
    return "ERROR";
  }
  if (!checkResultSignature(outSum, invId, signatureValue, pass2)) {
    return "ERROR";
  }

  try {
    const pending = await getPendingPayment(invId);
    if (!pending?.email || !pending?.product_id) {
      console.error("Pay result: no pending row for InvId (check inv_id in DB vs callback)", {
        invId,
        pendingFound: !!pending,
      });
    }
    if (pending?.email && pending?.product_id) {
      const outSumNumber = parsePaymentAmount(outSum);
      const pendingOutSumNumber = Number(pending.out_sum);
      const isOutSumMatch = paymentAmountsMatchWithinTolerance(outSumNumber, pendingOutSumNumber);

      if (!isOutSumMatch) {
        console.error("Pay result: out_sum mismatch", {
          outSum: outSumNumber,
          pendingOutSum: pendingOutSumNumber,
          invId,
        });
        return `OK${invId}`;
      }
      await upsertPurchaseAndDeletePending({
        invId,
        email: pending.email,
        productId: pending.product_id,
      });
    }
  } catch (e) {
    console.error("Pay result: failed to record purchase", e);
  }

  return `OK${invId}`;
}
