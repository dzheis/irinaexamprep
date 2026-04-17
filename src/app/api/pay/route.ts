import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createMethodologyPayment } from "@/application/useCases/payment/createPayment";
import { createServerClient } from "@/services/supabaseServer";

const ROBOKASSA_LOGIN = process.env["ROBOKASSA_LOGIN"];
const ROBOKASSA_PASS1 = process.env["ROBOKASSA_PASS1"];
const ROBOKASSA_TEST =
  process.env["ROBOKASSA_TEST"] === "1" || process.env["ROBOKASSA_TEST"] === "true";

type PayBody = {
  productId?: string;
};

export async function POST(req: NextRequest) {
  if (!ROBOKASSA_LOGIN || !ROBOKASSA_PASS1) {
    console.error("Pay: ROBOKASSA_LOGIN or ROBOKASSA_PASS1 not set");
    return NextResponse.json(
      { error: "Оплата временно недоступна. Настройте Robokassa в .env." },
      { status: 503 },
    );
  }

  const isProd = process.env["NODE_ENV"] === "production";
  const siteUrl = process.env["NEXT_PUBLIC_SITE_URL"]?.trim();
  if (isProd && !siteUrl) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  if (isProd) {
    const originHeader = req.headers.get("origin");
    const refererHeader = req.headers.get("referer");
    const secFetchSite = req.headers.get("sec-fetch-site");

    const allowedHostnames = new Set<string>();
    if (siteUrl) allowedHostnames.add(new URL(siteUrl).hostname);
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
  }

  const csrfCookie = (await cookies()).get("csrf_token")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: PayBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  const productId = (body.productId ?? "").trim();

  let payerEmail: string;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    payerEmail = user.email.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicSiteOrigin =
    process.env["NEXT_PUBLIC_SITE_URL"] ||
    (req.headers.get("x-forwarded-proto") && req.headers.get("host")
      ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
      : "");

  const result = await createMethodologyPayment({
    robokassaLogin: ROBOKASSA_LOGIN,
    robokassaPass1: ROBOKASSA_PASS1,
    robokassaTest: ROBOKASSA_TEST,
    productId,
    payerEmail,
    publicSiteOrigin,
  });

  if (!result.ok) {
    const status = result.error === "Invalid product" ? 400 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ redirectUrl: result.redirectUrl });
}
