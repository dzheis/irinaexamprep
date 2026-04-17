import { NextRequest, NextResponse } from "next/server";
import { completeAuthCodeExchange } from "@/application/useCases/auth/completeAuthCallback";
import { ROUTES } from "@/shared/constants/routes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get("next") ?? ROUTES.methodology;
  await completeAuthCodeExchange(searchParams.get("code"));
  return NextResponse.redirect(new URL(next, req.url));
}
