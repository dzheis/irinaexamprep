import type { AuthUser, PendingPaymentStatus } from "@/types/domain";

export type AuthSessionResponse = {
  user: AuthUser | null;
};

export type PurchasesResponse = {
  moduleIds: string[];
  error?: string;
  degraded?: boolean;
};

export type CsrfTokenResponse = {
  token: string | null;
};

export type PayResponse = {
  redirectUrl?: string;
  error?: string;
};

export type PaymentStatusResponse = {
  status: PendingPaymentStatus | "not_found";
  invId: string;
  productId?: string;
  callbackCount?: number;
  completedAt?: string | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  paidOutSum?: number | null;
  error?: string;
};

