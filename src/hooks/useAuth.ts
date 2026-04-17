"use client";

import { useMemo } from "react";
import { createBrowserClient } from "@/infrastructure/supabase/browser";

export function useAuth() {
  const supabase = useMemo(() => createBrowserClient(), []);

  return useMemo(
    () => ({
      signInWithPassword: supabase.auth.signInWithPassword.bind(supabase.auth),
      signUp: supabase.auth.signUp.bind(supabase.auth),
      resetPasswordForEmail: supabase.auth.resetPasswordForEmail.bind(supabase.auth),
      updateUser: supabase.auth.updateUser.bind(supabase.auth),
      getSession: supabase.auth.getSession.bind(supabase.auth),
    }),
    [supabase],
  );
}

