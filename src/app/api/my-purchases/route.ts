import { NextResponse } from "next/server";
import { getPurchasedModules } from "@/application/useCases/methodology/getPurchasedModules";

export async function GET() {
  try {
    const moduleIds = await getPurchasedModules();
    return NextResponse.json(
      { moduleIds, degraded: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("My purchases: failed to load purchases", error);
    return NextResponse.json(
      {
        moduleIds: [],
        degraded: true,
        error: "Не удалось подтвердить доступ к купленным материалам.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
