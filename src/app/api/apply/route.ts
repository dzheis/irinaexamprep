import { NextRequest, NextResponse } from "next/server";
import { submitApplyForm } from "@/application/useCases/content/submitApplyForm";
import { clientIp, mailLimiter } from "@/infrastructure/security/rateLimit";

export async function POST(req: NextRequest) {
  const rate = await mailLimiter.limit(`apply:${clientIp(req)}`);
  if (!rate.success) {
    return NextResponse.json(
      { success: false, error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const result = await submitApplyForm(body);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.httpStatus ?? 400 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Apply API error:", err);
    return NextResponse.json(
      { success: false, error: "Не удалось отправить заявку. Попробуйте позже." },
      { status: 500 },
    );
  }
}
