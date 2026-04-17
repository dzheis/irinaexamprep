import { NextResponse } from "next/server";
import { createServerClient } from "@/services/supabaseClient";

export async function POST() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
