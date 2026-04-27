import { parsePaymentAmount } from "@/domain/payment/paymentAmount";
import {
  normalizeRobokassaSignatureHex,
  resultSignatureSource,
} from "@/domain/payment/robokassaSignature";
import { md5Utf8HexUppercase } from "@/infrastructure/payment/robokassaHash";
import { sendPurchaseConfirmationForPayment } from "@/application/useCases/payment/sendPurchaseConfirmation";
import {
  finalizeRobokassaResult,
  recordPaymentCallback,
  type PaymentCallbackHeaders,
  type PaymentCallbackPayload,
} from "@/infrastructure/payment/persistence";

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

async function recordRejectedCallback(params: {
  invId: string;
  outSum: number | null;
  signatureValue: string;
  payload: PaymentCallbackPayload;
  headers: PaymentCallbackHeaders;
  httpMethod: string;
  sourceIp: string | null;
  processingOutcome: string;
  errorMessage: string;
  signatureValid: boolean;
}) {
  try {
    await recordPaymentCallback({
      invId: params.invId || null,
      httpMethod: params.httpMethod,
      outSum: params.outSum,
      signatureValue: params.signatureValue || null,
      signatureValid: params.signatureValid,
      sourceIp: params.sourceIp,
      headers: params.headers,
      payload: params.payload,
      processingOutcome: params.processingOutcome,
      errorMessage: params.errorMessage,
    });
  } catch (error) {
    console.error("Pay result: failed to record rejected callback", error);
  }
}

export async function verifyRobokassaPaymentResult(params: {
  outSum: string;
  invId: string;
  signatureValue: string;
  pass2: string;
  payload: PaymentCallbackPayload;
  headers: PaymentCallbackHeaders;
  httpMethod: string;
  sourceIp: string | null;
}): Promise<VerifyRobokassaResultBody> {
  const { outSum, invId, signatureValue, pass2 } = params;
  if (!outSum || !invId || !signatureValue) {
    await recordRejectedCallback({
      invId,
      outSum: null,
      signatureValue,
      payload: params.payload,
      headers: params.headers,
      httpMethod: params.httpMethod,
      sourceIp: params.sourceIp,
      processingOutcome: "missing_required_fields",
      errorMessage: "OutSum, InvId, or SignatureValue is missing.",
      signatureValid: false,
    });
    return "ERROR";
  }

  const outSumNumber = parsePaymentAmount(outSum);
  if (!Number.isFinite(outSumNumber)) {
    await recordRejectedCallback({
      invId,
      outSum: null,
      signatureValue,
      payload: params.payload,
      headers: params.headers,
      httpMethod: params.httpMethod,
      sourceIp: params.sourceIp,
      processingOutcome: "invalid_out_sum",
      errorMessage: "OutSum is not a valid numeric amount.",
      signatureValid: false,
    });
    return "ERROR";
  }

  if (!checkResultSignature(outSum, invId, signatureValue, pass2)) {
    await recordRejectedCallback({
      invId,
      outSum: outSumNumber,
      signatureValue,
      payload: params.payload,
      headers: params.headers,
      httpMethod: params.httpMethod,
      sourceIp: params.sourceIp,
      processingOutcome: "invalid_signature",
      errorMessage: "Robokassa signature validation failed.",
      signatureValid: false,
    });
    return "ERROR";
  }

  try {
    const result = await finalizeRobokassaResult({
      invId,
      outSum: outSumNumber.toFixed(2),
      signatureValue,
      httpMethod: params.httpMethod,
      payload: params.payload,
      headers: params.headers,
      sourceIp: params.sourceIp,
    });
    if (result.acknowledgement === "ok") {
      try {
        await sendPurchaseConfirmationForPayment(invId);
      } catch (emailError) {
        console.error("Pay result: failed to send purchase confirmation email", emailError);
      }
    }
    return result.acknowledgement === "ok" ? `OK${invId}` : "ERROR";
  } catch (error) {
    console.error("Pay result: failed to finalize payment", error);
    await recordRejectedCallback({
      invId,
      outSum: outSumNumber,
      signatureValue,
      payload: params.payload,
      headers: params.headers,
      httpMethod: params.httpMethod,
      sourceIp: params.sourceIp,
      processingOutcome: "finalization_exception",
      errorMessage: "Atomic payment finalization failed before acknowledgement.",
      signatureValid: true,
    });
    return "ERROR";
  }
}
