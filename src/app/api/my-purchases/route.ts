import { NextResponse } from "next/server";
import { getPurchasedModules } from "@/application/useCases/methodology/getPurchasedModules";

export async function GET() {
  try {
    const moduleIds = await getPurchasedModules();
    return NextResponse.json({ moduleIds });
  } catch {
    return NextResponse.json({ moduleIds: [] });
  }
}
