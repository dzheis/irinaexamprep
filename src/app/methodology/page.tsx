import { Suspense } from 'react';
import MethodologyClient from './methodology-client';

// Страница использует useSearchParams (результат оплаты). Без dynamic при build возможен prerender-error.
export const dynamic = 'force-dynamic';

export default function Methodology() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <span className="text-theme/70">Загрузка…</span>
        </div>
      }
    >
      <MethodologyClient />
    </Suspense>
  );
}
