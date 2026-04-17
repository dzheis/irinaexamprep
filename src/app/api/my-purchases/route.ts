import { NextResponse } from "next/server";
import { getPurchasedModuleIdsForCurrentUser } from "@/application/use-cases/methodology/getPurchasedModuleIdsForCurrentUser";

export async function GET() {
  try {
    const moduleIds = await getPurchasedModuleIdsForCurrentUser();
    return NextResponse.json({ moduleIds });
  } catch {
    return NextResponse.json({ moduleIds: [] });
  }
}
