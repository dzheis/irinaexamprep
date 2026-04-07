import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAllMethodologyModuleIds } from "@/lib/methodology-storyblok";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ moduleIds: [] });
    }
    const emailLower = user.email.trim().toLowerCase();
    if (ADMIN_EMAIL && emailLower === ADMIN_EMAIL) {
      const moduleIds = await getAllMethodologyModuleIds();
      return NextResponse.json({ moduleIds });
    }
    const db = createServiceClient();
    const { data: rows } = await db.from("purchases").select("module_id").eq("email", user.email);
    const moduleIds = (rows ?? []).map((r) => r.module_id).filter(Boolean);
    return NextResponse.json({ moduleIds });
  } catch {
    return NextResponse.json({ moduleIds: [] });
  }
}
