import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Webhook для Storyblok: при публикации контента Storyblok вызывает этот URL,
 * мы инвалидируем кэш страниц — при следующем заходе данные подтянутся заново.
 *
 * В Storyblok: Settings → Webhooks → Add webhook
 * URL: https://ваш-домен.vercel.app/api/revalidate
 * Trigger: "Story published" (и при желании "Story unpublished")
 * Secret: задайте пароль и добавьте его в Vercel env как REVALIDATE_SECRET
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
