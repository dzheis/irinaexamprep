import type { User } from "@/domain/auth/User";
import type { Result } from "@/domain/methodology/Result";

export type AuthUser = User;

export type Purchase = {
  module_id: string;
};

export type PendingPaymentRow = {
  email: string;
  product_id: string;
  out_sum: number;
};

export type PaymentProduct = {
  id: string;
  title: string;
  price: number;
};

export type ExamResult = Result;

