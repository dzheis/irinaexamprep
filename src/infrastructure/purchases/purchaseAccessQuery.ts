import { createServiceClient } from "@/infrastructure/supabase/server";

export async function hasPurchaseForEmailAndModule(params: {
  email: string;
  moduleId: string;
}): Promise<boolean> {
  const db = createServiceClient();
  const { data } = await db
    .from("purchases")
    .select("id")
    .eq("email", params.email)
    .eq("module_id", params.moduleId)
    .maybeSingle();
  return !!data;
}
