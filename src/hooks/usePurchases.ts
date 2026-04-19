"use client";

import { useCallback, useEffect, useState } from "react";
import type { PurchasesResponse } from "@/types/api";

export function usePurchases(deps: unknown[] = []) {
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/my-purchases")
      .then(async (r) => {
        const data = (await r.json()) as PurchasesResponse;
        if (!r.ok) {
          throw new Error(data?.error || "Не удалось загрузить покупки");
        }
        setModuleIds(Array.isArray(data?.moduleIds) ? data.moduleIds : []);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Не удалось загрузить покупки";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { moduleIds, loading, error, refetch };
}

