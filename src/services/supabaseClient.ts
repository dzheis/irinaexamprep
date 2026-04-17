import {
  createClient as createBrowserSupabaseClient,
} from "@/lib/supabase/client";
import {
  createClient as createServerSupabaseClient,
  createServiceClient as createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const createBrowserClient = createBrowserSupabaseClient;
export const createServerClient = createServerSupabaseClient;
export const createServiceClient = createServiceSupabaseClient;

