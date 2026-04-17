import { createServiceClient } from "@/infrastructure/supabase/server";
import type { Purchase } from "@/types/domain";

export async function getPurchasedModuleIdsByEmails(emails: string[]): Promise<string[]> {
  const uniqueEmails = [...new Set(emails.map((email) => email.trim()).filter(Boolean))];
  if (uniqueEmails.length === 0) return [];

  const db = createServiceClient();
  const { data: rows } = await db.from("purchases").select("module_id").in("email", uniqueEmails);
  return ((rows ?? []) as Purchase[]).map((row) => row.module_id).filter(Boolean);
}
