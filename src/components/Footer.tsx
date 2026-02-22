"use client";

import { memo } from 'react';

function Footer() {
  return (
    <footer className="nav border-t border-b-0 border-theme-light-bg/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-end text-theme">
          <span className="text-sm md:text-base text-right">
            © 2026 Designed & Developed by K. Savchenko
          </span>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
