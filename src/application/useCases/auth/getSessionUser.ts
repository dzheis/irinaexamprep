import type { AuthUser } from "@/types/domain";
import { getServerUser } from "@/services/userService";

export async function getSessionUser(): Promise<AuthUser | null> {
  return getServerUser();
}
