import { createServiceClient } from "@/infrastructure/supabase/server";
import type { PendingPaymentRow, Purchase } from "@/types/domain";

const FINALIZE_PAYMENT_RPC = "finalize_robokassa_result_payment";
export const OPEN_PENDING_PAYMENT_REUSE_TTL_MS = 1000 * 60 * 60;
const AGED_PENDING_ALERT_MS = 1000 * 60 * 15;
const CALLBACK_ISSUE_LOOKBACK_MS = 1000 * 60 * 60 * 24;

type OpenPendingPaymentRow = Pick<
  PendingPaymentRow,
  "inv_id" | "email" | "user_id" | "product_id" | "out_sum" | "status" | "created_at"
>;

export type PaymentCallbackPayload = Record<string, string>;
export type PaymentCallbackHeaders = Record<string, string>;

export type PaymentCallbackLogParams = {
  invId: string | null;
  httpMethod: string | null;
  outSum: number | null;
  signatureValue: string | null;
  signatureValid: boolean;
  sourceIp: string | null;
  headers: PaymentCallbackHeaders;
  payload: PaymentCallbackPayload;
  processingOutcome: string;
  errorMessage?: string | null;
};

export type FinalizeRobokassaResult = {
  acknowledgement: "ok" | "error";
  processingOutcome: string;
};

export type PaymentCallbackRow = {
  received_at: string;
  processing_outcome: string;
  signature_valid: boolean;
  out_sum: number | null;
  error_message: string | null;
  http_method: string | null;
};

export type PaymentOpsSummary = {
  agedPendingCount: number;
  reconciliationFailedCount: number;
  recentCallbackIssueCount: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function asObjectRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export function isPendingInvoiceReusable(createdAt: string, now = Date.now()): boolean {
  const createdAtMs = Date.parse(createdAt);
  return Number.isFinite(createdAtMs) && now - createdAtMs <= OPEN_PENDING_PAYMENT_REUSE_TTL_MS;
}

export function isUniqueViolationError(error: unknown): boolean {
  const record = asObjectRecord(error);
  return record?.["code"] === "23505";
}

export async function createPendingPayment(params: {
  invId: string;
  productId: string;
  email: string;
  userId: string | null;
  amount: number;
}): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("pending_payments").insert({
    inv_id: params.invId,
    product_id: params.productId,
    email: normalizeEmail(params.email),
    user_id: params.userId,
    out_sum: params.amount,
    status: "pending",
  });
  if (error) throw error;
}

export async function getOpenPendingPayment(params: {
  email: string;
  productId: string;
}): Promise<OpenPendingPaymentRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("pending_payments")
    .select("inv_id, email, user_id, product_id, out_sum, status, created_at")
    .eq("email", normalizeEmail(params.email))
    .eq("product_id", params.productId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as OpenPendingPaymentRow | null) ?? null;
}

export async function getPaymentByInvId(invId: string): Promise<PendingPaymentRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("pending_payments")
    .select(
      "inv_id, email, user_id, product_id, out_sum, status, completed_at, created_at, last_callback_at, callback_count, paid_out_sum, last_error_code, last_error_message, result_last_signature",
    )
    .eq("inv_id", invId)
    .maybeSingle();
  if (error) throw error;
  return (data as PendingPaymentRow | null) ?? null;
}

export async function getPaymentCallbacksByInvId(
  invId: string,
  limit = 20,
): Promise<PaymentCallbackRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payment_callbacks")
    .select("received_at, processing_outcome, signature_valid, out_sum, error_message, http_method")
    .eq("inv_id", invId)
    .order("received_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as PaymentCallbackRow[]) ?? [];
}

export async function getPurchasesByEmail(email: string): Promise<Purchase[]> {
  const supabase = createServiceClient();
  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await supabase
    .from("purchases")
    .select("module_id")
    .eq("email", normalizedEmail);
  if (error) throw error;
  return ((data ?? []) as Purchase[]) ?? [];
}

export async function getPaymentOpsSummary(): Promise<PaymentOpsSummary> {
  const supabase = createServiceClient();
  const agedPendingThreshold = new Date(Date.now() - AGED_PENDING_ALERT_MS).toISOString();
  const callbackIssueThreshold = new Date(Date.now() - CALLBACK_ISSUE_LOOKBACK_MS).toISOString();

  const [
    { count: agedPendingCount, error: agedPendingError },
    { count: reconciliationFailedCount, error: reconciliationFailedError },
    { count: recentCallbackIssueCount, error: callbackIssueError },
  ] = await Promise.all([
    supabase
      .from("pending_payments")
      .select("inv_id", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("created_at", agedPendingThreshold),
    supabase
      .from("pending_payments")
      .select("inv_id", { count: "exact", head: true })
      .eq("status", "reconciliation_failed"),
    supabase
      .from("payment_callbacks")
      .select("id", { count: "exact", head: true })
      .in("processing_outcome", ["missing_invoice", "amount_mismatch", "finalization_exception"])
      .gte("received_at", callbackIssueThreshold),
  ]);

  if (agedPendingError) throw agedPendingError;
  if (reconciliationFailedError) throw reconciliationFailedError;
  if (callbackIssueError) throw callbackIssueError;

  return {
    agedPendingCount: agedPendingCount ?? 0,
    reconciliationFailedCount: reconciliationFailedCount ?? 0,
    recentCallbackIssueCount: recentCallbackIssueCount ?? 0,
  };
}

export async function hasPurchaseForEmailAndProduct(params: {
  email: string;
  productId: string;
}): Promise<boolean> {
  const supabase = createServiceClient();
  const normalizedEmail = normalizeEmail(params.email);
  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("email", normalizedEmail)
    .eq("module_id", params.productId)
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) && data.length > 0;
}

export async function markPendingPaymentExpired(params: {
  invId: string;
  errorCode: string;
  errorMessage: string;
}): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("pending_payments")
    .update({
      status: "expired",
      last_error_code: params.errorCode,
      last_error_message: params.errorMessage,
    })
    .eq("inv_id", params.invId)
    .eq("status", "pending");
  if (error) throw error;
}

export async function recordPaymentCallback(params: PaymentCallbackLogParams): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("payment_callbacks").insert({
    inv_id: params.invId,
    http_method: params.httpMethod,
    out_sum: params.outSum,
    signature_value: params.signatureValue,
    signature_valid: params.signatureValid,
    source_ip: params.sourceIp,
    headers: params.headers,
    payload: params.payload,
    processing_outcome: params.processingOutcome,
    error_message: params.errorMessage ?? null,
  });
  if (error) throw error;
}

export async function finalizeRobokassaResult(params: {
  invId: string;
  outSum: string;
  signatureValue: string;
  httpMethod: string;
  payload: PaymentCallbackPayload;
  headers: PaymentCallbackHeaders;
  sourceIp: string | null;
}): Promise<FinalizeRobokassaResult> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc(FINALIZE_PAYMENT_RPC, {
    p_inv_id: params.invId,
    p_out_sum: params.outSum,
    p_signature_value: params.signatureValue,
    p_http_method: params.httpMethod,
    p_payload: params.payload,
    p_headers: params.headers,
    p_source_ip: params.sourceIp,
  });
  if (error) throw error;

  const result = asObjectRecord(data);
  const acknowledgement = result?.["acknowledgement"];
  const processingOutcome = result?.["processing_outcome"];

  if (
    (acknowledgement !== "ok" && acknowledgement !== "error") ||
    typeof processingOutcome !== "string"
  ) {
    throw new Error("Unexpected finalize_robokassa_result_payment response");
  }

  return {
    acknowledgement: acknowledgement as "ok" | "error",
    processingOutcome,
  };
}
