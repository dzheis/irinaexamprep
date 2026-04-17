import { NextRequest, NextResponse } from "next/server";
import { getMethodologyVideoEmbedUrl } from "@/application/useCases/methodology/getVideoEmbedUrl";

const STATUS_MAP: Record<string, { status: number; body: string }> = {
  bad_request: { status: 400, body: "Missing module" },
  unauthorized: { status: 401, body: "Unauthorized" },
  forbidden: { status: 403, body: "Forbidden" },
  not_found: { status: 404, body: "Not found" },
  error: { status: 500, body: "Error" },
};

export async function GET(req: NextRequest) {
  const result = await getMethodologyVideoEmbedUrl(req.nextUrl.searchParams.get("module"));
  if (result.status === "ok") {
    return NextResponse.redirect(result.embedUrl, 302);
  }
  const mapped = STATUS_MAP[result.status] ?? STATUS_MAP["error"]!;
  return new NextResponse(mapped.body, { status: mapped.status });
}
