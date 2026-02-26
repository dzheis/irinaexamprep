"use client";

import Link from 'next/link';
import { memo } from 'react';

function Footer() {
  return (
    <footer className="nav border-t border-b-0 border-theme-light-bg/30 min-h-[4.5rem] flex items-center">
      <div className="container mx-auto px-6 py-4 w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-theme flex-wrap">
          <div className="flex items-center gap-4">
            <Link
              href="/offer"
              className="text-xs md:text-sm min-[1200px]:text-base min-[1200px]:md:text-lg text-theme-accent hover:text-theme underline transition-colors"
            >
              Публичная оферта
            </Link>
            <Link
              href="/privacy"
              className="text-xs md:text-sm min-[1200px]:text-base min-[1200px]:md:text-lg text-theme-accent hover:text-theme underline transition-colors"
            >
              Политика конфиденциальности
            </Link>
          </div>
          <p className="text-xs text-theme/80">
            Реквизиты и контактные данные — в разделе 8 оферты и в платёжных документах.
          </p>
        </div>
        <span className="text-xs md:text-sm min-[1200px]:text-base min-[1200px]:md:text-lg text-theme text-right">
          © 2026 Designed & Developed by K. Savchenko
        </span>
      </div>
    </footer>
  );
}

export default memo(Footer);
