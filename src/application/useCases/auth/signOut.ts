import { signOutServerSession } from "@/infrastructure/auth/supabaseSession";

export async function signOutCurrentUser(): Promise<void> {
  await signOutServerSession();
}
