import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { startMethodologyCheckout } from "@/application/useCases/payment/startMethodologyCheckout";
import { clientIp, payLimiter } from "@/infrastructure/security/rateLimit";

type PayBody = {
  productId?: string;
};

function enforceSameOrigin(req: NextRequest): NextResponse | null {
  const isProd = process.env["NODE_ENV"] === "production";
  if (!isProd) return null;

  const siteUrl = process.env["NEXT_PUBLIC_SITE_URL"]?.trim();
  if (!siteUrl) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");
  const secFetchSite = req.headers.get("sec-fetch-site");

  const allowedHostnames = new Set<string>();
  allowedHostnames.add(new URL(siteUrl).hostname);
  allowedHostnames.add("localhost");
  allowedHostnames.add("127.0.0.1");

  const parseHostname = (v: string | null) => {
    if (!v) return null;
    try {
      return new URL(v).hostname;
    } catch {
      return null;
    }
  };

  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reqHostname = parseHostname(originHeader) ?? parseHostname(refererHeader);
  if (!reqHostname || !allowedHostnames.has(reqHostname)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

async function enforceCsrf(req: NextRequest): Promise<NextResponse | null> {
  const csrfCookie = (await cookies()).get("csrf_token")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function resolvePublicSiteOrigin(req: NextRequest): string {
  return (
    process.env["NEXT_PUBLIC_SITE_URL"] ||
    (req.headers.get("x-forwarded-proto") && req.headers.get("host")
      ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
      : "")
  );
}

export async function POST(req: NextRequest) {
  const originCheck = enforceSameOrigin(req);
  if (originCheck) return originCheck;

  const csrfCheck = await enforceCsrf(req);
  if (csrfCheck) return csrfCheck;

  const rate = await payLimiter.limit(`pay:${clientIp(req)}`);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: PayBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  const result = await startMethodologyCheckout({
    productId: (body.productId ?? "").trim(),
    publicSiteOrigin: resolvePublicSiteOrigin(req),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.httpStatus });
  }
  return NextResponse.json({ redirectUrl: result.redirectUrl });
}
