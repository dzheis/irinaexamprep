import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { verifyRobokassaPaymentResult } from "@/application/useCases/payment/verifyPayment";
import { getRobokassaResultPass2 } from "@/infrastructure/payment/robokassaConfig";
import {
  recordPaymentCallback,
  type PaymentCallbackHeaders,
  type PaymentCallbackPayload,
} from "@/infrastructure/payment/persistence";

const OBSERVED_HEADER_NAMES = [
  "content-type",
  "host",
  "origin",
  "referer",
  "user-agent",
  "x-forwarded-for",
  "x-real-ip",
] as const;

function plainResponse(text: string) {
  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function toPayloadRecord(searchParams: URLSearchParams): PaymentCallbackPayload {
  const payload: PaymentCallbackPayload = {};
  for (const [key, value] of searchParams.entries()) {
    payload[key] = value;
  }
  return payload;
}

function formDataToPayload(formData: FormData): PaymentCallbackPayload {
  const payload: PaymentCallbackPayload = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      payload[key] = value;
    }
  }
  return payload;
}

function pickObservedHeaders(req: NextRequest): PaymentCallbackHeaders {
  const headers: PaymentCallbackHeaders = {};
  for (const name of OBSERVED_HEADER_NAMES) {
    const value = req.headers.get(name);
    if (value) {
      headers[name] = value;
    }
  }
  return headers;
}

function resolveSourceIp(req: NextRequest): string | null {
  const candidates = [
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    req.headers.get("x-real-ip")?.trim() ?? null,
  ];

  for (const candidate of candidates) {
    if (candidate && isIP(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function recordRejectedCallback(params: {
  payload: PaymentCallbackPayload;
  httpMethod: string;
  headers: PaymentCallbackHeaders;
  sourceIp: string | null;
  processingOutcome: string;
  errorMessage: string;
}) {
  const outSumRaw = params.payload["OutSum"];
  const outSumParsed = outSumRaw ? Number(outSumRaw.replace(/\s/g, "").replace(",", ".")) : null;

  try {
    await recordPaymentCallback({
      invId: params.payload["InvId"] ?? null,
      httpMethod: params.httpMethod,
      outSum: Number.isFinite(outSumParsed) ? outSumParsed : null,
      signatureValue: params.payload["SignatureValue"] ?? null,
      signatureValid: false,
      sourceIp: params.sourceIp,
      headers: params.headers,
      payload: params.payload,
      processingOutcome: params.processingOutcome,
      errorMessage: params.errorMessage,
    });
  } catch (error) {
    console.error("Pay result: failed to record callback before verification", error);
  }
}

async function handleResult(params: {
  payload: PaymentCallbackPayload;
  httpMethod: string;
  headers: PaymentCallbackHeaders;
  sourceIp: string | null;
}) {
  const robokassaPass2 = getRobokassaResultPass2();

  if (!robokassaPass2) {
    console.error("Pay result: ROBOKASSA_PASS2 not set");
    await recordRejectedCallback({
      payload: params.payload,
      httpMethod: params.httpMethod,
      headers: params.headers,
      sourceIp: params.sourceIp,
      processingOutcome: "server_not_configured",
      errorMessage: "ROBOKASSA_PASS2 is not configured.",
    });
    return plainResponse("ERROR");
  }

  const body = await verifyRobokassaPaymentResult({
    outSum: params.payload["OutSum"] ?? "",
    invId: params.payload["InvId"] ?? "",
    signatureValue: params.payload["SignatureValue"] ?? "",
    pass2: robokassaPass2,
    payload: params.payload,
    headers: params.headers,
    httpMethod: params.httpMethod,
    sourceIp: params.sourceIp,
  });
  return plainResponse(body);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return handleResult({
    payload: toPayloadRecord(searchParams),
    httpMethod: "GET",
    headers: pickObservedHeaders(req),
    sourceIp: resolveSourceIp(req),
  });
}

export async function POST(req: NextRequest) {
  let payload: PaymentCallbackPayload = {};
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await req.text();
    payload = toPayloadRecord(new URLSearchParams(body));
  } else if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    payload = formDataToPayload(form);
  } else {
    const body = await req.text();
    if (body.trim()) {
      payload = toPayloadRecord(new URLSearchParams(body));
    }
  }
  return handleResult({
    payload,
    httpMethod: "POST",
    headers: pickObservedHeaders(req),
    sourceIp: resolveSourceIp(req),
  });
}
