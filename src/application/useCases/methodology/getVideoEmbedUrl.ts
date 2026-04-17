import { getAuthenticatedUserEmail } from "@/infrastructure/auth/supabaseSession";
import { hasPurchaseForEmailAndModule } from "@/infrastructure/purchases/purchaseAccessQuery";
import { getVideoIdByModuleIdFromStoryblok } from "@/infrastructure/methodology/methodologyStoryblok";
import { isMethodologyAdminEmail } from "@/domain/methodology/adminAccess";

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"]?.trim().toLowerCase() || "";

export type VideoEmbedResult =
  | { status: "ok"; embedUrl: string }
  | { status: "unauthorized" | "forbidden" | "not_found" | "bad_request" | "error" };

/**
 * Resolve a protected methodology video embed URL for the authenticated viewer.
 * Enforces: authentication → admin bypass OR purchase-based access → Storyblok video id lookup.
 */
export async function getMethodologyVideoEmbedUrl(
  rawModuleId: string | null,
): Promise<VideoEmbedResult> {
  const moduleId = rawModuleId?.trim() ?? "";
  if (!moduleId) return { status: "bad_request" };

  try {
    const email = await getAuthenticatedUserEmail();
    if (!email) return { status: "unauthorized" };

    const isAdmin = isMethodologyAdminEmail(email, ADMIN_EMAIL);
    if (!isAdmin) {
      const allowed = await hasPurchaseForEmailAndModule({ email, moduleId });
      if (!allowed) return { status: "forbidden" };
    }

    const videoId = await getVideoIdByModuleIdFromStoryblok(moduleId);
    if (!videoId) return { status: "not_found" };

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    return { status: "ok", embedUrl };
  } catch {
    return { status: "error" };
  }
}
