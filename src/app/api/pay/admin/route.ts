import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/application/useCases/auth/getSessionUser";
import { isMethodologyAdminEmail } from "@/domain/methodology/adminAccess";
import {
  getPaymentByInvId,
  getPaymentCallbacksByInvId,
  getPaymentOpsSummary,
  getPurchasesByEmail,
} from "@/infrastructure/payment/persistence";

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"]?.trim().toLowerCase() || "";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.email || !isMethodologyAdminEmail(user.email, ADMIN_EMAIL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invId = req.nextUrl.searchParams.get("invId")?.trim() ?? "";
    if (!invId) {
      const summary = await getPaymentOpsSummary();
      return NextResponse.json(summary, { headers: { "Cache-Control": "no-store" } });
    }

    const invoice = await getPaymentByInvId(invId);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const [callbacks, purchases] = await Promise.all([
      getPaymentCallbacksByInvId(invId),
      getPurchasesByEmail(invoice.email),
    ]);

    return NextResponse.json(
      {
        invoice,
        callbacks,
        purchases,
        purchaseGranted: purchases.some((purchase) => purchase.module_id === invoice.product_id),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Pay admin: diagnostics request failed", error);
    return NextResponse.json({ error: "Diagnostics unavailable" }, { status: 503 });
  }
}
