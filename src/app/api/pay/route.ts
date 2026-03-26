import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const ROBOKASSA_LOGIN = process.env.ROBOKASSA_LOGIN;
const ROBOKASSA_PASS1 = process.env.ROBOKASSA_PASS1;
const ROBOKASSA_TEST = process.env.ROBOKASSA_TEST === "1" || process.env.ROBOKASSA_TEST === "true";
const ROBOKASSA_BASE_URL = "https://auth.robokassa.ru/Merchant/Index.aspx";

type PayBody = {
  productId?: string;
};

// Server-side authoritative pricing for methodology purchases.
// This prevents price tampering from the client.
const METHODOLOGY_PRICE_BY_PRODUCT_ID: Record<string, number> = {
  "1": 1990,
};

function buildSignature(login: string, outSum: string, invId: string, pass1: string): string {
  const str = `${login}:${outSum}:${invId}:${pass1}`;
  return crypto.createHash("md5").update(str, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  if (!ROBOKASSA_LOGIN || !ROBOKASSA_PASS1) {
    console.error("Pay: ROBOKASSA_LOGIN or ROBOKASSA_PASS1 not set");
    return NextResponse.json(
      { error: "Оплата временно недоступна. Настройте Robokassa в .env." },
      { status: 503 }
    );
  }

  const isProd = process.env.NODE_ENV === "production";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (isProd && !siteUrl) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  // Origin hardening (best-effort): only allow requests from our site.
  // Note: this is not a full CSRF protection by itself; it is validated together with CSRF token below.
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

  // CSRF validation: double-submit token (cookie + header).
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
  const amount = METHODOLOGY_PRICE_BY_PRODUCT_ID[productId];
  if (!amount || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  let email: string;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    email = user.email.trim();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const outSum = amount.toFixed(2);
  const invId = String(Math.abs((Date.now() >>> 0) % 2147483647));
  const signature = buildSignature(ROBOKASSA_LOGIN, outSum, invId, ROBOKASSA_PASS1);

  try {
    const supabase = createServiceClient();
    await supabase.from("pending_payments").insert({
      inv_id: invId,
      product_id: productId,
      email,
      out_sum: amount,
    });
  } catch (e) {
    console.error("Pay: failed to save pending_payment", e);
    return NextResponse.json({ error: "Ошибка сохранения заказа" }, { status: 500 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (req.headers.get("x-forwarded-proto") && req.headers.get("host")
      ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
      : "");
  const successUrl = origin ? `${origin}/methodology?payment=success` : "";
  const failUrl = origin ? `${origin}/methodology?payment=fail` : "";

  const params = new URLSearchParams({
    MerchantLogin: ROBOKASSA_LOGIN,
    OutSum: outSum,
    InvId: invId,
    SignatureValue: signature,
    Culture: "ru",
    ...(ROBOKASSA_TEST && { IsTest: "1" }),
    Email: email,
    ...(successUrl && { SuccessURL: successUrl }),
    ...(failUrl && { FailURL: failUrl }),
  });

  const redirectUrl = `${ROBOKASSA_BASE_URL}?${params.toString()}`;

  return NextResponse.json({ redirectUrl });
}
