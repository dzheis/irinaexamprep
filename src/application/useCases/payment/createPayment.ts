import { getMethodologyProductPriceRub } from "@/domain/payment/methodologyProducts";
import { paySignatureSource } from "@/domain/payment/robokassaSignature";
import { md5Utf8HexUppercase, randomRobokassaInvId } from "@/infrastructure/payment/robokassaHash";
import { ROUTES } from "@/shared/constants/routes";
import { createPendingPayment } from "@/infrastructure/payment/persistence";

const ROBOKASSA_BASE_URL = "https://auth.robokassa.ru/Merchant/Index.aspx";

function buildPaySignatureMd5(login: string, outSum: string, invId: string, pass1: string): string {
  return md5Utf8HexUppercase(paySignatureSource(login, outSum, invId, pass1));
}

export type CreateMethodologyPaymentResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

/**
 * Creates Robokassa redirect for a methodology product after HTTP layer has authenticated the payer.
 */
export async function createMethodologyPayment(params: {
  robokassaLogin: string;
  robokassaPass1: string;
  robokassaTest: boolean;
  productId: string;
  payerEmail: string;
  /** Base site URL for SuccessURL / FailURL (no trailing path). */
  publicSiteOrigin: string;
}): Promise<CreateMethodologyPaymentResult> {
  const amount = getMethodologyProductPriceRub(params.productId);
  if (amount === undefined) {
    return { ok: false, error: "Invalid product" };
  }

  const outSum = amount.toFixed(2);
  const invId = randomRobokassaInvId();
  const signature = buildPaySignatureMd5(params.robokassaLogin, outSum, invId, params.robokassaPass1);

  try {
    await createPendingPayment({
      invId,
      productId: params.productId,
      email: params.payerEmail,
      amount,
    });
  } catch {
    return { ok: false, error: "Ошибка сохранения заказа" };
  }

  const origin = params.publicSiteOrigin.replace(/\/$/, "");
  const successUrl = origin ? `${origin}${ROUTES.methodology}?payment=success` : "";
  const failUrl = origin ? `${origin}${ROUTES.methodology}?payment=fail` : "";

  const search = new URLSearchParams({
    MerchantLogin: params.robokassaLogin,
    OutSum: outSum,
    InvId: invId,
    Description: "Методика: цифровой доступ к материалам",
    SignatureValue: signature,
    Culture: "ru",
    Encoding: "utf-8",
    ...(params.robokassaTest && { IsTest: "1" }),
    Email: params.payerEmail,
    ...(successUrl && { SuccessURL: successUrl }),
    ...(failUrl && { FailURL: failUrl }),
  });

  return { ok: true, redirectUrl: `${ROBOKASSA_BASE_URL}?${search.toString()}` };
}
