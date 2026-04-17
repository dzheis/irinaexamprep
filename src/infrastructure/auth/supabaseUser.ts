import { cache } from "react";
import type { AuthUser } from "@/types/domain";
import { createServerClient } from "@/infrastructure/supabase/server";

/**
 * Single Supabase auth.getUser() adapter for the entire request.
 * React.cache deduplicates concurrent/sequential calls within one server request,
 * so the route + use case + middleware layer do not re-hit Supabase auth.
 */
export const getServerUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, ...(user.email ? { email: user.email } : {}) };
});
