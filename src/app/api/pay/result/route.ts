import { NextRequest, NextResponse } from "next/server";
import { verifyRobokassaPaymentResult } from "@/application/useCases/payment/verifyPayment";

const ROBOKASSA_PASS2 = process.env["ROBOKASSA_PASS2"];

function plainResponse(text: string) {
  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function handleResult(params: {
  OutSum: string | null;
  InvId: string | null;
  SignatureValue: string | null;
}) {
  if (!ROBOKASSA_PASS2) {
    console.error("Pay result: ROBOKASSA_PASS2 not set");
    return plainResponse("ERROR");
  }
  const outSum = params.OutSum ?? "";
  const invId = params.InvId ?? "";
  const signatureValue = params.SignatureValue ?? "";
  if (!outSum || !invId || !signatureValue) {
    console.error("Pay result: missing OutSum, InvId or SignatureValue", {
      hasOutSum: !!outSum,
      hasInvId: !!invId,
      hasSignature: !!signatureValue,
    });
    return plainResponse("ERROR");
  }

  const body = await verifyRobokassaPaymentResult({
    outSum,
    invId,
    signatureValue,
    pass2: ROBOKASSA_PASS2,
  });
  return plainResponse(body);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return handleResult({
    OutSum: searchParams.get("OutSum"),
    InvId: searchParams.get("InvId"),
    SignatureValue: searchParams.get("SignatureValue"),
  });
}

function extractResultFields(sp: URLSearchParams) {
  return {
    OutSum: sp.get("OutSum"),
    InvId: sp.get("InvId"),
    SignatureValue: sp.get("SignatureValue"),
  };
}

export async function POST(req: NextRequest) {
  let OutSum: string | null = null;
  let InvId: string | null = null;
  let SignatureValue: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await req.text();
    ({ OutSum, InvId, SignatureValue } = extractResultFields(new URLSearchParams(body)));
  } else if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    OutSum = form.get("OutSum") as string | null;
    InvId = form.get("InvId") as string | null;
    SignatureValue = form.get("SignatureValue") as string | null;
  } else {
    const body = await req.text();
    if (body.trim()) {
      ({ OutSum, InvId, SignatureValue } = extractResultFields(new URLSearchParams(body)));
    }
  }
  return handleResult({ OutSum, InvId, SignatureValue });
}
