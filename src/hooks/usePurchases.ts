"use client";

import { useCallback, useEffect, useState } from "react";
import type { PurchasesResponse } from "@/types/api";

export function usePurchases(deps: unknown[] = []) {
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch("/api/my-purchases")
      .then((r) => r.json())
      .then((data: PurchasesResponse) => setModuleIds(Array.isArray(data?.moduleIds) ? data.moduleIds : []))
      .catch(() => setModuleIds([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { moduleIds, loading, refetch };
}

