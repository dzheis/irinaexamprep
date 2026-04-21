"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "@/types/domain";
import type { AuthSessionResponse } from "@/types/api";

/**
 * Dedupe `/api/auth/session` across components.
 *
 * Multiple components (`AuthHeaderBlock`, `methodology-client`, …) mount on the same
 * page and each called `fetch("/api/auth/session")` independently. Each call goes
 * through the Supabase-refreshing middleware, so the redundant calls cost ~150-200ms
 * apiece. We cache the last successful response for a short TTL and share any in-flight
 * promise — enough to collapse the burst on initial mount without ever serving stale
 * data between pages (TTL is intentionally small, and `refetch()` always bypasses it).
 */
const SESSION_CACHE_TTL_MS = 5_000;

type CachedSession = { user: AuthUser | null; at: number };

let inflight: Promise<AuthUser | null> | null = null;
let cached: CachedSession | null = null;

async function fetchSessionOnce(force: boolean): Promise<AuthUser | null> {
  if (!force && cached && Date.now() - cached.at < SESSION_CACHE_TTL_MS) {
    return cached.user;
  }
  if (!force && inflight) return inflight;

  const p = (async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await res.json()) as AuthSessionResponse;
      const user = data?.user ?? null;
      cached = { user, at: Date.now() };
      return user;
    } catch {
      return null;
    }
  })();

  inflight = p;
  try {
    return await p;
  } finally {
    if (inflight === p) inflight = null;
  }
}

export function useUser(deps: unknown[] = []) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const next = await fetchSessionOnce(true);
    setUser(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSessionOnce(false).then((next) => {
      if (!alive) return;
      setUser(next);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { user, loading, refetch };
}
