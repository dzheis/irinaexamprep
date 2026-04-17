"use client";

import { useEffect, useState } from "react";
import type { CsrfTokenResponse } from "@/types/api";

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/csrf-token")
      .then((r) => r.json())
      .then((data: CsrfTokenResponse) => setToken(typeof data?.token === "string" ? data.token : null))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  return { token, loading };
}

