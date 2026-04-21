import { paySignatureSource } from "@/domain/payment/robokassaSignature";
import { resolveMethodologyCheckoutAmountRub } from "@/infrastructure/methodology/methodologyStoryblok";
import { METHODOLOGY_CHECKOUT_DISABLED_RU } from "@/shared/constants/methodologyCheckout";
import { md5Utf8HexUppercase, randomRobokassaInvId } from "@/infrastructure/payment/robokassaHash";
import {
  createPendingPayment,
  getOpenPendingPayment,
  hasPurchaseForEmailAndProduct,
  isPendingInvoiceReusable,
  isUniqueViolationError,
  markPendingPaymentExpired,
} from "@/infrastructure/payment/persistence";
import { ROUTES } from "@/shared/constants/routes";

const ROBOKASSA_BASE_URL = "https://auth.robokassa.ru/Merchant/Index.aspx";

function buildPaySignatureMd5(login: string, outSum: string, invId: string, pass1: string): string {
  return md5Utf8HexUppercase(paySignatureSource(login, outSum, invId, pass1));
}

function buildRedirectUrl(params: {
  robokassaLogin: string;
  robokassaPass1: string;
  robokassaTest: boolean;
  payerEmail: string;
  publicSiteOrigin: string;
  amount: number;
  invId: string;
}): string {
  const outSum = params.amount.toFixed(2);
  const signature = buildPaySignatureMd5(
    params.robokassaLogin,
    outSum,
    params.invId,
    params.robokassaPass1,
  );
  const origin = params.publicSiteOrigin.replace(/\/$/, "");
  const successUrl = origin
    ? `${origin}${ROUTES.methodology}?payment=success&invId=${encodeURIComponent(params.invId)}`
    : "";
  const failUrl = origin
    ? `${origin}${ROUTES.methodology}?payment=fail&invId=${encodeURIComponent(params.invId)}`
    : "";

  const search = new URLSearchParams({
    MerchantLogin: params.robokassaLogin,
    OutSum: outSum,
    InvId: params.invId,
    Description: "Методика: цифровой доступ к материалам",
    SignatureValue: signature,
    Culture: "ru",
    Encoding: "utf-8",
    ...(params.robokassaTest && { IsTest: "1" }),
    Email: params.payerEmail,
    ...(successUrl && { SuccessURL: successUrl }),
    ...(failUrl && { FailURL: failUrl }),
  });

  return `${ROBOKASSA_BASE_URL}?${search.toString()}`;
}

export type CreateMethodologyPaymentResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string; httpStatus: number };

export async function createMethodologyPayment(params: {
  robokassaLogin: string;
  robokassaPass1: string;
  robokassaTest: boolean;
  productId: string;
  payerEmail: string;
  payerUserId: string;
  publicSiteOrigin: string;
}): Promise<CreateMethodologyPaymentResult> {
  const resolved = await resolveMethodologyCheckoutAmountRub(params.productId);
  if (!resolved.ok) {
    if (resolved.reason === "invalid_product") {
      return { ok: false, error: "Invalid product", httpStatus: 400 };
    }
    return { ok: false, error: METHODOLOGY_CHECKOUT_DISABLED_RU, httpStatus: 503 };
  }
  const amount = resolved.amount;

  try {
    const alreadyPurchased = await hasPurchaseForEmailAndProduct({
      email: params.payerEmail,
      productId: params.productId,
    });
    if (alreadyPurchased) {
      return {
        ok: false,
        error: "Доступ уже активирован для этого материала.",
        httpStatus: 409,
      };
    }

    const existingPending = await getOpenPendingPayment({
      email: params.payerEmail,
      productId: params.productId,
    });

    if (existingPending) {
      if (
        Number(existingPending.out_sum) === amount &&
        isPendingInvoiceReusable(existingPending.created_at)
      ) {
        return {
          ok: true,
          redirectUrl: buildRedirectUrl({
            robokassaLogin: params.robokassaLogin,
            robokassaPass1: params.robokassaPass1,
            robokassaTest: params.robokassaTest,
            payerEmail: params.payerEmail,
            publicSiteOrigin: params.publicSiteOrigin,
            amount,
            invId: existingPending.inv_id,
          }),
        };
      }

      await markPendingPaymentExpired({
        invId: existingPending.inv_id,
        errorCode:
          Number(existingPending.out_sum) === amount ? "stale_pending_invoice" : "price_changed",
        errorMessage:
          Number(existingPending.out_sum) === amount
            ? "Expired before checkout reuse because the pending invoice is too old."
            : "Expired before checkout reuse because the product price changed.",
      });
    }

    const invId = randomRobokassaInvId();
    await createPendingPayment({
      invId,
      productId: params.productId,
      email: params.payerEmail,
      userId: params.payerUserId,
      amount,
    });

    return {
      ok: true,
      redirectUrl: buildRedirectUrl({
        robokassaLogin: params.robokassaLogin,
        robokassaPass1: params.robokassaPass1,
        robokassaTest: params.robokassaTest,
        payerEmail: params.payerEmail,
        publicSiteOrigin: params.publicSiteOrigin,
        amount,
        invId,
      }),
    };
  } catch (error) {
    if (isUniqueViolationError(error)) {
      try {
        const existingPending = await getOpenPendingPayment({
          email: params.payerEmail,
          productId: params.productId,
        });

        if (existingPending && Number(existingPending.out_sum) === amount) {
          return {
            ok: true,
            redirectUrl: buildRedirectUrl({
              robokassaLogin: params.robokassaLogin,
              robokassaPass1: params.robokassaPass1,
              robokassaTest: params.robokassaTest,
              payerEmail: params.payerEmail,
              publicSiteOrigin: params.publicSiteOrigin,
              amount,
              invId: existingPending.inv_id,
            }),
          };
        }
      } catch {}
    }

    return { ok: false, error: "Ошибка сохранения заказа", httpStatus: 500 };
  }
}
