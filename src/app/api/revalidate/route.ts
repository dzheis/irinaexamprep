import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";

/** Storyblok publish webhook: requires a secret matching `REVALIDATE_SECRET`. */
const REVALIDATE_SECRET = process.env["REVALIDATE_SECRET"];

type StoryblokWebhookBody = {
  full_slug?: string;
  slug?: string;
  story?: { full_slug?: string; slug?: string };
};

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  if (!REVALIDATE_SECRET?.trim()) {
    console.warn("Revalidate: REVALIDATE_SECRET not set");
    return NextResponse.json({ error: "Revalidation not configured" }, { status: 503 });
  }

  const secret = req.headers.get("x-revalidate-secret") ?? req.nextUrl.searchParams.get("secret");
  if (!secret || !safeEqual(secret, REVALIDATE_SECRET)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let storySlug: string | undefined;
  try {
    const body = (await req.json()) as StoryblokWebhookBody;
    const s = body?.story?.full_slug ?? body?.story?.slug ?? body?.full_slug ?? body?.slug;
    if (typeof s === "string" && s.trim()) storySlug = s.trim();
  } catch {
    // Empty or non-JSON body is fine.
  }

  try {
    // Root layout loads `config` + `home` from Storyblok; invalidating the layout refreshes
    // header/footer and all nested routes that depend on published content.
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, storySlug, now: Date.now() });
  } catch (e) {
    console.error("Revalidate error:", e);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
