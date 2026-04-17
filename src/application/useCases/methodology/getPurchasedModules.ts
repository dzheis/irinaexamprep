import { isMethodologyAdminEmail } from "@/domain/methodology/adminAccess";
import { getAllMethodologyModuleIds } from "@/infrastructure/methodology/storyblokModuleIds";
import { getPurchasedModuleIdsByEmails } from "@/services/lessonService";
import { getServerUser } from "@/services/userService";

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"]?.trim().toLowerCase() || "";

/** Resolve purchased module ids for a known email (no session lookup). */
export async function getPurchasedModuleIdsForUserEmail(email: string): Promise<string[]> {
  const emailLower = email.trim().toLowerCase();
  const emailRaw = email.trim();

  if (isMethodologyAdminEmail(emailLower, ADMIN_EMAIL)) {
    return getAllMethodologyModuleIds();
  }

  const emailVariants = [...new Set([emailLower, emailRaw])];
  return getPurchasedModuleIdsByEmails(emailVariants);
}

export async function getPurchasedModules(): Promise<string[]> {
  const user = await getServerUser();
  if (!user?.email) return [];
  return getPurchasedModuleIdsForUserEmail(user.email);
}
