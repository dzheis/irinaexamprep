import { NextResponse } from "next/server";
import { getAllMethodologyModuleIds } from "@/lib/methodology-storyblok";
import { getPurchasedModuleIdsByEmails } from "@/services/lessonService";
import { getServerUser } from "@/services/userService";

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"]?.trim().toLowerCase() || "";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user?.email) {
      return NextResponse.json({ moduleIds: [] });
    }
    const emailLower = user.email.trim().toLowerCase();
    const emailRaw = user.email.trim();
    if (ADMIN_EMAIL && emailLower === ADMIN_EMAIL) {
      const moduleIds = await getAllMethodologyModuleIds();
      return NextResponse.json({ moduleIds });
    }
    const emailVariants = [...new Set([emailLower, emailRaw])];
    const moduleIds = await getPurchasedModuleIdsByEmails(emailVariants);
    return NextResponse.json({ moduleIds });
  } catch {
    return NextResponse.json({ moduleIds: [] });
  }
}
