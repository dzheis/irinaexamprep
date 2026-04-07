import { NextRequest, NextResponse } from "next/server";

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
  const filename = req.nextUrl.searchParams.get("filename")?.trim();

  if (!url || !isAllowedUrl(url)) {
    return new NextResponse("Invalid or disallowed URL", { status: 400 });
  }

  try {
    const res = await fetch(url, { headers: { Accept: "*/*" } });
    if (!res.ok) {
      return new NextResponse("File not found", { status: 404 });
    }
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const contentDisposition = filename
      ? `attachment; filename="${filename.replace(/"/g, '\\"')}"`
      : (res.headers.get("content-disposition") ?? "attachment");
    const body = res.body;
    if (!body) return new NextResponse("No content", { status: 502 });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Download failed", { status: 502 });
  }
}
