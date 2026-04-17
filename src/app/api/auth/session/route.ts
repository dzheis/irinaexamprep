import { NextResponse } from "next/server";
import { getServerUser } from "@/services/userService";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
