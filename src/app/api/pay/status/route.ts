import { NextRequest, NextResponse } from "next/server";
import { getOwnPaymentStatus } from "@/application/useCases/payment/getPaymentStatus";

export async function GET(req: NextRequest) {
  const result = await getOwnPaymentStatus(req.nextUrl.searchParams.get("invId"));

  switch (result.status) {
    case "bad_request":
      return NextResponse.json({ error: "Missing invId" }, { status: 400 });
    case "unauthorized":
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    case "not_found":
      return NextResponse.json(
        {
          status: "not_found",
          invId: req.nextUrl.searchParams.get("invId") ?? "",
        },
        { status: 404 },
      );
    case "error":
      return NextResponse.json({ error: "Payment status unavailable" }, { status: 503 });
    case "ok":
      return NextResponse.json({
        status: result.paymentStatus,
        invId: result.invId,
        productId: result.productId,
        callbackCount: result.callbackCount,
        completedAt: result.completedAt,
        lastErrorCode: result.lastErrorCode,
        lastErrorMessage: result.lastErrorMessage,
        paidOutSum: result.paidOutSum,
      });
    default:
      return NextResponse.json({ error: "Payment status unavailable" }, { status: 503 });
  }
}
