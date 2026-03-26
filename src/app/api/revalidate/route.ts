import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Storyblok webhook: when content is published, Storyblok calls this URL.
 * We invalidate page cache so data is fetched again on the next visit.
 *
 * In Storyblok: Settings → Webhooks → Add webhook
 * URL: https://your-domain.vercel.app/api/revalidate
 * Trigger: "Story published" (and optionally "Story unpublished")
 * Secret: set a password and add it to Vercel env as REVALIDATE_SECRET
 */

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(req: NextRequest) {
  if (!REVALIDATE_SECRET?.trim()) {
    console.warn('Revalidate: REVALIDATE_SECRET not set');
    return NextResponse.json(
      { error: 'Revalidation not configured' },
      { status: 503 }
    );
  }

  const secret = req.headers.get('x-revalidate-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    revalidatePath('/');
    revalidatePath('/courses');
    revalidatePath('/methodology');
    revalidatePath('/free-resources');
    revalidatePath('/offer');
    revalidatePath('/payment-refund');
    revalidatePath('/privacy');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (e) {
    console.error('Revalidate error:', e);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
