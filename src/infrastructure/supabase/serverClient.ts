import {
  createClient as createServerSupabaseClient,
  createServiceClient as createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const createServerClient = createServerSupabaseClient;
export const createServiceClient = createServiceSupabaseClient;

