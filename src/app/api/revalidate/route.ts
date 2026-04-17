import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/shared/constants/routes";

/** Storyblok publish webhook: requires `x-revalidate-secret` / `?secret=` matching `REVALIDATE_SECRET`. */
const REVALIDATE_SECRET = process.env["REVALIDATE_SECRET"];

export async function POST(req: NextRequest) {
  if (!REVALIDATE_SECRET?.trim()) {
    console.warn("Revalidate: REVALIDATE_SECRET not set");
    return NextResponse.json({ error: "Revalidation not configured" }, { status: 503 });
  }

  const secret = req.headers.get("x-revalidate-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    revalidatePath(ROUTES.home);
    revalidatePath(ROUTES.courses);
    revalidatePath(ROUTES.methodology);
    revalidatePath(ROUTES.freeResources);
    revalidatePath(ROUTES.offer);
    revalidatePath(ROUTES.paymentRefund);
    revalidatePath(ROUTES.privacy);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (e) {
    console.error("Revalidate error:", e);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
