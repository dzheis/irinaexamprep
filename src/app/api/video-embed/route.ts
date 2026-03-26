import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getVideoIdByModuleIdFromStoryblok } from '@/lib/methodology-storyblok';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';

export async function GET(req: NextRequest) {
  const moduleId = req.nextUrl.searchParams.get('module');
  if (!moduleId?.trim()) {
    return new NextResponse('Missing module', { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const emailLower = user.email.trim().toLowerCase();
    const isAdmin = !!ADMIN_EMAIL && emailLower === ADMIN_EMAIL;
    if (!isAdmin) {
      const db = createServiceClient();
      const { data: row } = await db.from('purchases').select('id').eq('email', user.email).eq('module_id', moduleId.trim()).maybeSingle();
      if (!row) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
    const videoId = await getVideoIdByModuleIdFromStoryblok(moduleId.trim());
    if (!videoId) {
      return new NextResponse('Not found', { status: 404 });
    }
    // Try to minimize YouTube branding/UI inside the iframe.
    // Some UI elements (e.g. "Watch on YouTube") are controlled by YouTube itself and can't be fully disabled.
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    return NextResponse.redirect(embedUrl, 302);
  } catch {
    return new NextResponse('Error', { status: 500 });
  }
}
