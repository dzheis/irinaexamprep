import type { AuthUser } from "@/types/domain";
import { getSessionUser } from "@/application/useCases/auth/getSessionUser";
import { getPurchasedModuleIdsForUserEmail } from "@/application/useCases/methodology/getPurchasedModules";

export async function getUserMethodologyAccess(): Promise<{
  user: AuthUser | null;
  moduleIds: string[];
}> {
  const user = await getSessionUser();
  if (!user?.email) {
    return { user, moduleIds: [] };
  }
  const moduleIds = await getPurchasedModuleIdsForUserEmail(user.email);
  return { user, moduleIds };
}
