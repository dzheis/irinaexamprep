import { getAllMethodologyModuleIds } from "@/lib/methodology-storyblok";
import { getPurchasedModuleIdsByEmails } from "@/services/lessonService";
import { getServerUser } from "@/services/userService";

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"]?.trim().toLowerCase() || "";

export async function getPurchasedModuleIdsForCurrentUser(): Promise<string[]> {
  const user = await getServerUser();
  if (!user?.email) return [];

  const emailLower = user.email.trim().toLowerCase();
  const emailRaw = user.email.trim();

  if (ADMIN_EMAIL && emailLower === ADMIN_EMAIL) {
    return getAllMethodologyModuleIds();
  }

  const emailVariants = [...new Set([emailLower, emailRaw])];
  return getPurchasedModuleIdsByEmails(emailVariants);
}

