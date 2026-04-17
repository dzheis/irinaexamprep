import type { AuthUser } from "@/types/domain";
import { getServerUser } from "@/infrastructure/auth/supabaseUser";

export async function getSessionUser(): Promise<AuthUser | null> {
  return getServerUser();
}
