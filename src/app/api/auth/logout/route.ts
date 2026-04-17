import { NextResponse } from "next/server";
import { signOutCurrentUser } from "@/application/useCases/auth/signOut";

export async function POST() {
  await signOutCurrentUser();
  return NextResponse.json({ ok: true });
}
