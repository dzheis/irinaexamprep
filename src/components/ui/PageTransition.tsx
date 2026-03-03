"use client";

import { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div id="page-content" className="relative flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
