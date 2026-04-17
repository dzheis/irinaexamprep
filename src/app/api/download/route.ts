import { NextRequest, NextResponse } from "next/server";
import { fetchRemoteFileStream } from "@/infrastructure/http/remoteFileFetch";

const ALLOWED_ORIGINS = ["https://a.storyblok.com", "https://s3.amazonaws.com"];

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const origin = `${u.protocol}//${u.host}`;
    return ALLOWED_ORIGINS.some(
      (allowed) => origin === allowed || u.hostname.endsWith(".storyblok.com"),
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename")?.trim() ?? null;

  if (!url || !isAllowedUrl(url)) {
    return new NextResponse("Invalid or disallowed URL", { status: 400 });
  }

  const result = await fetchRemoteFileStream(url, filename);
  if (result.status !== "ok") {
    if (result.status === "not_found") return new NextResponse("File not found", { status: 404 });
    if (result.status === "no_content") return new NextResponse("No content", { status: 502 });
    return new NextResponse("Download failed", { status: 502 });
  }

  return new NextResponse(result.body, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": result.contentDisposition,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
