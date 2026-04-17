import { getAuthenticatedUserEmail } from "@/infrastructure/auth/supabaseSession";
import { createMethodologyPayment } from "@/application/useCases/payment/createPayment";

export type StartMethodologyCheckoutResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string; httpStatus: number };

/**
 * HTTP-agnostic orchestrator: verify environment, resolve authenticated payer,
 * delegate to payment creation. Routes should call this directly.
 */
export async function startMethodologyCheckout(params: {
  productId: string;
  publicSiteOrigin: string;
}): Promise<StartMethodologyCheckoutResult> {
  const robokassaLogin = process.env["ROBOKASSA_LOGIN"];
  const robokassaPass1 = process.env["ROBOKASSA_PASS1"];
  const robokassaTest =
    process.env["ROBOKASSA_TEST"] === "1" || process.env["ROBOKASSA_TEST"] === "true";

  if (!robokassaLogin || !robokassaPass1) {
    return {
      ok: false,
      error: "Оплата временно недоступна. Настройте Robokassa в .env.",
      httpStatus: 503,
    };
  }

  let payerEmail: string | null = null;
  try {
    payerEmail = await getAuthenticatedUserEmail();
  } catch {
    return { ok: false, error: "Unauthorized", httpStatus: 401 };
  }
  if (!payerEmail) {
    return { ok: false, error: "Unauthorized", httpStatus: 401 };
  }

  const result = await createMethodologyPayment({
    robokassaLogin,
    robokassaPass1,
    robokassaTest,
    productId: params.productId,
    payerEmail,
    publicSiteOrigin: params.publicSiteOrigin,
  });

  if (!result.ok) {
    const status = result.error === "Invalid product" ? 400 : 500;
    return { ok: false, error: result.error, httpStatus: status };
  }
  return { ok: true, redirectUrl: result.redirectUrl };
}
