import { createServiceClient } from "@/services/supabaseClient";
import type { PendingPaymentRow } from "@/types/domain";

export async function createPendingPayment(params: {
  invId: string;
  productId: string;
  email: string;
  amount: number;
}): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("pending_payments").insert({
    inv_id: params.invId,
    product_id: params.productId,
    email: params.email,
    out_sum: params.amount,
  });
  if (error) throw error;
}

export async function getPendingPayment(invId: string): Promise<PendingPaymentRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("pending_payments")
    .select("email, product_id, out_sum")
    .eq("inv_id", invId)
    .maybeSingle();
  if (error) throw error;
  return (data as PendingPaymentRow | null) ?? null;
}

export async function upsertPurchaseAndDeletePending(params: {
  invId: string;
  email: string;
  productId: string;
}): Promise<void> {
  const supabase = createServiceClient();
  const normalizedEmail = params.email.trim().toLowerCase();

  const { error: upsertError } = await supabase.from("purchases").upsert(
    { email: normalizedEmail, module_id: params.productId },
    { onConflict: "email,module_id" },
  );
  if (upsertError) throw upsertError;

  const { error: deleteError } = await supabase.from("pending_payments").delete().eq("inv_id", params.invId);
  if (deleteError) throw deleteError;
}

