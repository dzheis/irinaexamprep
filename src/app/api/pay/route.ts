import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

const ROBOKASSA_LOGIN = process.env.ROBOKASSA_LOGIN;
const ROBOKASSA_PASS1 = process.env.ROBOKASSA_PASS1;
const ROBOKASSA_TEST = process.env.ROBOKASSA_TEST === "1" || process.env.ROBOKASSA_TEST === "true";
const ROBOKASSA_BASE_URL = "https://auth.robokassa.ru/Merchant/Index.aspx";

type PayBody = {
  productId?: string;
  outSum: number;
  email?: string;
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

  let body: PayBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  const amount = Number(body.outSum);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Укажите корректную сумму" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!email) {
    return NextResponse.json({ error: "Укажите email" }, { status: 400 });
  }
  const productId = (body.productId ?? "").trim() || "1";

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
    ...(body.email?.trim() && { Email: body.email.trim() }),
    ...(successUrl && { SuccessURL: successUrl }),
    ...(failUrl && { FailURL: failUrl }),
  });

  const redirectUrl = `${ROBOKASSA_BASE_URL}?${params.toString()}`;

  return NextResponse.json({ redirectUrl });
}
