import type { AuthUser } from "@/types/domain";
import { createServerClient } from "@/services/supabaseServer";

export async function getServerUser(): Promise<AuthUser | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, ...(user.email ? { email: user.email } : {}) };
}

