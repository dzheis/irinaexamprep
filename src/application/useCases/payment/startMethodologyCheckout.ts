import { getAuthenticatedUserIdentity } from "@/infrastructure/auth/supabaseSession";
import { createMethodologyPayment } from "@/application/useCases/payment/createPayment";
import { getRobokassaPaymentPass1, isRobokassaTestMode } from "@/infrastructure/payment/robokassaConfig";

export type StartMethodologyCheckoutResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string; httpStatus: number };

export async function startMethodologyCheckout(params: {
  productId: string;
  publicSiteOrigin: string;
}): Promise<StartMethodologyCheckoutResult> {
  const robokassaLogin = process.env["ROBOKASSA_LOGIN"];
  const robokassaPass1 = getRobokassaPaymentPass1();
  const robokassaTest = isRobokassaTestMode();

  if (!robokassaLogin || !robokassaPass1) {
    return {
      ok: false,
      error: "Оплата временно недоступна. Настройте Robokassa в .env.",
      httpStatus: 503,
    };
  }

  let payerIdentity: { id: string; email: string } | null = null;
  try {
    payerIdentity = await getAuthenticatedUserIdentity();
  } catch {
    return { ok: false, error: "Unauthorized", httpStatus: 401 };
  }
  if (!payerIdentity) {
    return { ok: false, error: "Unauthorized", httpStatus: 401 };
  }

  const result = await createMethodologyPayment({
    robokassaLogin,
    robokassaPass1,
    robokassaTest,
    productId: params.productId,
    payerEmail: payerIdentity.email,
    payerUserId: payerIdentity.id,
    publicSiteOrigin: params.publicSiteOrigin,
  });

  if (!result.ok) {
    return { ok: false, error: result.error, httpStatus: result.httpStatus };
  }
  return { ok: true, redirectUrl: result.redirectUrl };
}
