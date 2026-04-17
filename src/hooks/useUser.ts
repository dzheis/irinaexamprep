"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "@/types/domain";
import type { AuthSessionResponse } from "@/types/api";

export function useUser(deps: unknown[] = []) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: AuthSessionResponse) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { user, loading, refetch };
}

