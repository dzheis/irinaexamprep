import { NextRequest, NextResponse } from "next/server";
import { subscribeUser } from "@/application/useCases/content/subscribeUser";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const result = await subscribeUser(email);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.httpStatus ?? 400 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe API error:", err);
    return NextResponse.json(
      { success: false, error: "Не удалось оформить подписку. Попробуйте позже." },
      { status: 500 },
    );
  }
}
