import { NextRequest, NextResponse } from "next/server";
import { submitApplyForm } from "@/application/useCases/content/submitApplyForm";

export async function POST(req: NextRequest) {
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
