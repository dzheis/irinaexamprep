import { Suspense } from 'react';
import MethodologyClient from './methodology-client';
import { getMethodologyFromStoryblok } from '@/lib/methodology-storyblok';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Methodology() {
  const { title: pageTitle, videos } = await getMethodologyFromStoryblok();
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <span className="text-theme/70">Загрузка…</span>
        </div>
      }
    >
      <MethodologyClient pageTitle={pageTitle} videos={videos.length > 0 ? videos : undefined} />
    </Suspense>
  );
}
