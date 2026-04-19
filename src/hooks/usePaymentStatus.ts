"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaymentStatusResponse } from "@/types/api";

const TERMINAL_STATUSES = new Set(["completed", "expired", "reconciliation_failed", "not_found"]);
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

export function usePaymentStatus(invId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<PaymentStatusResponse["status"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<PaymentStatusResponse | null>(null);

  const refetch = useCallback(async (): Promise<PaymentStatusResponse["status"] | null> => {
    if (!enabled || !invId) return null;
    setLoading(true);
    try {
      const res = await fetch(`/api/pay/status?invId=${encodeURIComponent(invId)}`, {
        credentials: "include",
      });
      const data = (await res.json().catch(() => null)) as PaymentStatusResponse | { error?: string } | null;

      if (!res.ok) {
        const nextError = data && typeof data === "object" && "error" in data ? data.error : null;
        setError(nextError || "Не удалось получить статус платежа.");

        if (res.status === 404) {
          setStatus("not_found");
          setDetails({ status: "not_found", invId });
          return "not_found";
        }

        return null;
      }

      const nextDetails =
        data && typeof data === "object" && "status" in data ? (data as PaymentStatusResponse) : null;
      setError(null);
      setStatus(nextDetails?.status ?? null);
      setDetails(nextDetails);
      return nextDetails?.status ?? null;
    } catch {
      setError("Не удалось получить статус платежа.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, invId]);

  useEffect(() => {
    if (!enabled || !invId) {
      setStatus(null);
      setDetails(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      const nextStatus = await refetch();
      if (cancelled) return;
      if (nextStatus && TERMINAL_STATUSES.has(nextStatus)) return;
      if (attempts >= MAX_POLL_ATTEMPTS) return;
      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, invId, refetch]);

  return { status, loading, error, details, refetch };
}
