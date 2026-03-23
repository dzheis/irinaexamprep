'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Tooltip from '@/components/ui/Tooltip';

type Session = { user: { id: string; email?: string } } | null;

const EMAIL_STYLE_LIKE_NAV =
  'inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-theme-accent bg-transparent';

export default function AuthHeaderBlock({ className = '', variant = 'desktop' }: { className?: string; variant?: 'desktop' | 'mobile' }) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const rafId = requestAnimationFrame(() => {
      if (!cancelled) setLoading(true);
    });
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSession(data.user ? { user: data.user } : null);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    router.push('/');
    router.refresh();
  };

  if (loading) return null;

  if (session?.user?.email) {
    const isMobile = variant === 'mobile';
    return (
      <div className={`flex items-center gap-2 min-w-0 ${className}`}>
        <span
          className={
            isMobile
              ? `${EMAIL_STYLE_LIKE_NAV} min-w-0 truncate max-w-[200px] sm:max-w-[240px]`
              : 'inline-flex items-center rounded-full px-3 py-1.5 min-[1200px]:px-4 min-[1200px]:py-2 text-sm min-[1200px]:text-base font-semibold text-theme truncate max-w-[120px] min-[1200px]:max-w-[180px]'
          }
          title={session.user.email}
        >
          {session.user.email}
        </span>
        <Tooltip label="Sign out">
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-shrink-0 items-center justify-center w-9 h-9 min-[1200px]:w-10 min-[1200px]:h-10 rounded-full text-theme/80 hover:text-theme hover:bg-theme/10 transition-colors duration-200"
            aria-label="Sign out"
          >
            <svg className="w-5 h-5 min-[1200px]:w-6 min-[1200px]:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <Tooltip label="Sign in">
        <Link
          href="/login"
          className="flex flex-shrink-0 items-center justify-center w-9 h-9 min-[1200px]:w-10 min-[1200px]:h-10 rounded-full text-theme/80 hover:text-theme hover:bg-theme/10 transition-colors duration-200 no-underline"
          aria-label="Sign in"
        >
          <svg className="w-5 h-5 min-[1200px]:w-6 min-[1200px]:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </Link>
      </Tooltip>
      <Tooltip label="Sign up">
        <Link
          href="/signup"
          className="flex flex-shrink-0 items-center justify-center w-9 h-9 min-[1200px]:w-10 min-[1200px]:h-10 rounded-full text-theme/80 hover:text-theme hover:bg-theme/10 transition-colors duration-200 no-underline"
          aria-label="Sign up"
        >
          <svg className="w-5 h-5 min-[1200px]:w-6 min-[1200px]:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </Link>
      </Tooltip>
    </div>
  );
}
