import type { User } from "@/domain/auth/User";
import type { Result } from "@/domain/methodology/Result";

export type AuthUser = User;

export type Purchase = {
  module_id: string;
};

export type PendingPaymentStatus =
  | "pending"
  | "completed"
  | "expired"
  | "reconciliation_failed";

export type PendingPaymentRow = {
  inv_id: string;
  email: string;
  user_id: string | null;
  product_id: string;
  out_sum: number;
  status: PendingPaymentStatus;
  completed_at: string | null;
  created_at: string;
  last_callback_at: string | null;
  callback_count: number;
  paid_out_sum: number | null;
  last_error_code: string | null;
  last_error_message: string | null;
  result_last_signature: string | null;
  confirmation_email_claimed_at: string | null;
  confirmation_email_sent_at: string | null;
  confirmation_email_last_error: string | null;
};

export type PaymentProduct = {
  id: string;
  title: string;
  price: number;
};

export type ExamResult = Result;

