import type { AuthUser } from "@/types/domain";

export type AuthSessionResponse = {
  user: AuthUser | null;
};

export type PurchasesResponse = {
  moduleIds: string[];
};

export type CsrfTokenResponse = {
  token: string | null;
};

export type PayResponse = {
  redirectUrl?: string;
  error?: string;
};

