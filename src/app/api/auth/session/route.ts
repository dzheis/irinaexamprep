import { NextResponse } from "next/server";
import { getServerUserForDisplay } from "@/infrastructure/auth/supabaseUser";

/**
 * Display-only session endpoint (used by navbar/profile UI on the client).
 *
 * Uses the local-cookie `getSession()` path — no Supabase round-trip — which
 * cuts this endpoint from ~150-250ms to ~5-15ms. Any authorization check
 * elsewhere (payments, purchases, admin) still calls `getServerUser()` which
 * revalidates against Supabase Auth.
 */
export async function GET() {
  try {
    const user = await getServerUserForDisplay();
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
