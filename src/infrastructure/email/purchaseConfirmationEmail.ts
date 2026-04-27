import { ROUTES } from "@/shared/constants/routes";
import { createGmailTransporter } from "@/infrastructure/email/gmailTransporter";

const FROM_EMAIL = process.env["EMAIL_USER"];
const SITE_URL = process.env["NEXT_PUBLIC_SITE_URL"] || "";
const DEFAULT_PRODUCT_TITLE = "Методика: цифровой доступ к материалам";

export type PurchaseConfirmationEmailPayload = {
  email: string;
  productId: string;
  amountRub: number;
  invId: string;
};

function absoluteUrl(path: string): string {
  return SITE_URL ? `${SITE_URL.replace(/\/$/, "")}${path}` : path;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRub(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

function productTitle(productId: string): string {
  if (productId === "1") return DEFAULT_PRODUCT_TITLE;
  return `${DEFAULT_PRODUCT_TITLE} #${productId}`;
}

function buildPurchaseConfirmationText(payload: PurchaseConfirmationEmailPayload): string {
  const methodologyUrl = absoluteUrl(ROUTES.methodology);
  return `Здравствуйте!

Спасибо за покупку на сайте Irina Exam Preparation.

Оплата успешно получена, доступ к материалам открыт.

Материал: ${productTitle(payload.productId)}
Сумма: ${formatRub(payload.amountRub)}
Номер заказа: ${payload.invId}

Перейти к материалам:
${methodologyUrl}

Это письмо подтверждает оплату и открытие доступа. Оно не является фискальным чеком.

С пожеланиями успехов в подготовке к экзаменам,
Команда Irina Exam Preparation`;
}

function buildPurchaseConfirmationHtml(payload: PurchaseConfirmationEmailPayload): string {
  const methodologyUrl = absoluteUrl(ROUTES.methodology);
  const title = escapeHtml(productTitle(payload.productId));
  const amount = escapeHtml(formatRub(payload.amountRub));
  const invId = escapeHtml(payload.invId);

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#f6f7fb; padding:24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:16px; padding:28px 24px 22px; box-shadow:0 10px 30px rgba(16,24,40,0.08);">
        <div style="text-align:left; margin-bottom:18px;">
          <div style="font-size:14px; color:#667085; letter-spacing:0.2px; margin-bottom:8px;">Irina Exam Preparation</div>
          <div style="font-size:24px; line-height:1.2; font-weight:800; color:#101828;">
            Оплата получена
          </div>
        </div>

        <div style="font-size:15px; line-height:1.6; color:#344054;">
          <p style="margin:0 0 12px;">Здравствуйте!</p>
          <p style="margin:0 0 12px;">
            Спасибо за покупку. Мы получили подтверждение оплаты от Robokassa и открыли доступ к материалам.
          </p>
        </div>

        <div style="background:#F9FAFB; border:1px solid #EAECF0; border-radius:14px; padding:16px; margin:18px 0;">
          <div style="font-size:13px; color:#667085; margin-bottom:6px;">Материал</div>
          <div style="font-size:16px; font-weight:800; color:#101828; margin-bottom:12px;">${title}</div>
          <div style="font-size:13px; color:#667085; margin-bottom:6px;">Сумма</div>
          <div style="font-size:16px; font-weight:800; color:#101828; margin-bottom:12px;">${amount}</div>
          <div style="font-size:13px; color:#667085; margin-bottom:6px;">Номер заказа</div>
          <div style="font-size:14px; color:#344054; word-break:break-all;">${invId}</div>
        </div>

        <div style="text-align:center; margin:18px 0 12px;">
          <a href="${methodologyUrl}"
             style="display:inline-block; background:#39485C; color:#ffffff; text-decoration:none; font-weight:700; padding:12px 18px; border-radius:12px; font-size:15px;">
            Перейти к материалам
          </a>
        </div>

        <div style="font-size:12px; line-height:1.6; color:#98A2B3; margin-top:16px; text-align:center;">
          Это письмо подтверждает оплату и открытие доступа. Оно не является фискальным чеком.<br/>
          Если кнопка не работает, скопируйте ссылку в браузер:<br/>
          <span style="word-break:break-all;">${methodologyUrl}</span>
        </div>

        <div style="margin-top:22px; border-top:1px solid #EAECF0; padding-top:16px;">
          <div style="font-size:13px; color:#344054; margin-bottom:6px;">С пожеланиями успехов в подготовке к экзаменам,</div>
          <div style="font-size:14px; font-weight:800; color:#101828;">Команда Irina Exam Preparation</div>
        </div>
      </td>
    </tr>
  </table>
</div>`;
}

export async function sendPurchaseConfirmationEmail(
  payload: PurchaseConfirmationEmailPayload,
): Promise<void> {
  const transporter = createGmailTransporter();
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: payload.email,
    subject: "Оплата получена — доступ открыт — Irina Exam Prep",
    text: buildPurchaseConfirmationText(payload),
    html: buildPurchaseConfirmationHtml(payload),
  });
}
