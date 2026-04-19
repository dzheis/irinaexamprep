import { getAuthenticatedUserIdentity } from "@/infrastructure/auth/supabaseSession";
import { getPaymentByInvId } from "@/infrastructure/payment/persistence";

export type GetOwnPaymentStatusResult =
  | { status: "bad_request" | "unauthorized" | "not_found" | "error" }
  | {
      status: "ok";
      paymentStatus: "pending" | "completed" | "expired" | "reconciliation_failed";
      invId: string;
      productId: string;
      callbackCount: number;
      completedAt: string | null;
      lastErrorCode: string | null;
      lastErrorMessage: string | null;
      paidOutSum: number | null;
    };

export async function getOwnPaymentStatus(rawInvId: string | null): Promise<GetOwnPaymentStatusResult> {
  const invId = rawInvId?.trim() ?? "";
  if (!invId) return { status: "bad_request" };

  try {
    const identity = await getAuthenticatedUserIdentity();
    if (!identity) return { status: "unauthorized" };

    const payment = await getPaymentByInvId(invId);
    if (!payment) return { status: "not_found" };

    const matchesUserId = !!payment.user_id && payment.user_id === identity.id;
    const matchesEmail = payment.email.trim().toLowerCase() === identity.email.trim().toLowerCase();
    if (!matchesUserId && !matchesEmail) {
      return { status: "not_found" };
    }

    return {
      status: "ok",
      paymentStatus: payment.status,
      invId: payment.inv_id,
      productId: payment.product_id,
      callbackCount: payment.callback_count,
      completedAt: payment.completed_at,
      lastErrorCode: payment.last_error_code,
      lastErrorMessage: payment.last_error_message,
      paidOutSum: payment.paid_out_sum,
    };
  } catch {
    return { status: "error" };
  }
}
