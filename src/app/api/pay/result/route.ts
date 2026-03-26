import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

const ROBOKASSA_PASS2 = process.env.ROBOKASSA_PASS2;

function checkResultSignature(outSum: string, invId: string, signatureValue: string, pass2: string): boolean {
  const str = `${outSum}:${invId}:${pass2}`;
  const expected = crypto.createHash("md5").update(str, "utf8").digest("hex").toUpperCase();
  return expected === (signatureValue ?? "").toUpperCase();
}

function plainResponse(text: string) {
  return new NextResponse(text, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

async function handleResult(params: { OutSum: string | null; InvId: string | null; SignatureValue: string | null }) {
  if (!ROBOKASSA_PASS2) {
    console.error("Pay result: ROBOKASSA_PASS2 not set");
    return plainResponse("ERROR");
  }
  const outSum = params.OutSum ?? "";
  const invId = params.InvId ?? "";
  const signatureValue = params.SignatureValue ?? "";
  if (!outSum || !invId || !signatureValue) {
    return plainResponse("ERROR");
  }
  if (!checkResultSignature(outSum, invId, signatureValue, ROBOKASSA_PASS2)) {
    console.error("Pay result: invalid signature", { outSum, invId });
    return plainResponse("ERROR");
  }

  try {
    const supabase = createServiceClient();
    const { data: pending } = await supabase
      .from("pending_payments")
      .select("email, product_id, out_sum")
      .eq("inv_id", invId)
      .single();
    if (pending?.email && pending?.product_id) {
      const outSumNumber = Number(outSum);
      const pendingOutSumNumber = Number(pending.out_sum);
      const isOutSumMatch = Number.isFinite(outSumNumber) && Number.isFinite(pendingOutSumNumber) && Math.abs(outSumNumber - pendingOutSumNumber) <= 0.01;

      if (!isOutSumMatch) {
        console.error("Pay result: out_sum mismatch", { outSum: outSumNumber, pendingOutSum: pendingOutSumNumber, invId });
        return plainResponse(`OK${invId}`);
      }

      await supabase.from("purchases").upsert(
        { email: pending.email, module_id: pending.product_id },
        { onConflict: "email,module_id" }
      );
      await supabase.from("pending_payments").delete().eq("inv_id", invId);
    }
  } catch (e) {
    console.error("Pay result: failed to record purchase", e);
  }

  return plainResponse(`OK${invId}`);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return handleResult({
    OutSum: searchParams.get("OutSum"),
    InvId: searchParams.get("InvId"),
    SignatureValue: searchParams.get("SignatureValue"),
  });
}

export async function POST(req: NextRequest) {
  let OutSum: string | null = null;
  let InvId: string | null = null;
  let SignatureValue: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await req.text();
    const sp = new URLSearchParams(body);
    OutSum = sp.get("OutSum");
    InvId = sp.get("InvId");
    SignatureValue = sp.get("SignatureValue");
  } else if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    OutSum = form.get("OutSum") as string | null;
    InvId = form.get("InvId") as string | null;
    SignatureValue = form.get("SignatureValue") as string | null;
  }
  return handleResult({ OutSum, InvId, SignatureValue });
}
