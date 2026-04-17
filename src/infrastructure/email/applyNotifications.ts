import type { ApplyFormInput } from "@/types/applyForm";
import { ROUTES } from "@/shared/constants/routes";
import { createGmailTransporter } from "@/infrastructure/email/gmailTransporter";

const TEACHER_EMAIL = process.env["APPLY_NOTIFY_EMAIL"] || "dzheis@gmail.com";
const FROM_EMAIL = process.env["EMAIL_USER"];
const SITE_URL = process.env["NEXT_PUBLIC_SITE_URL"] || "";

function buildTeacherText(data: ApplyFormInput): string {
  const lines: string[] = [
    `Новая заявка на курс${data.courseTitle ? `: ${data.courseTitle}` : ""}`,
    "",
    "Кто подал заявку:",
    `Имя: ${data.firstName}`,
    `Фамилия: ${data.lastName}`,
    data.middleName ? `Отчество: ${data.middleName}` : null,
    `Email: ${data.email}`,
    data.telegram ? `Telegram: ${data.telegram}` : null,
    data.instagram ? `Instagram: ${data.instagram}` : null,
    data.whatsapp ? `WhatsApp: ${data.whatsapp}` : null,
  ].filter(Boolean) as string[];
  return lines.join("\n");
}

function buildTeacherHtml(data: ApplyFormInput): string {
  const rows = [
    ["Имя", data.firstName],
    ["Фамилия", data.lastName],
    ...(data.middleName ? [["Отчество", data.middleName]] : []),
    ["Email", data.email],
    ...(data.telegram ? [["Telegram", data.telegram]] : []),
    ...(data.instagram ? [["Instagram", data.instagram]] : []),
    ...(data.whatsapp ? [["WhatsApp", data.whatsapp]] : []),
  ];
  const trs = rows
    .map(
      ([label, val]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#555;">${label}</td><td style="padding:6px 0;">${val}</td></tr>`,
    )
    .join("");
  return `
    <div style="font-family: sans-serif; max-width: 560px; line-height: 1.6;">
      <p><strong>Новая заявка на курс</strong>${data.courseTitle ? `: ${data.courseTitle}` : ""}</p>
      <p>Контактные данные:</p>
      <table style="border-collapse: collapse;">${trs}</table>
    </div>
  `;
}

export async function sendApplyFormEmails(payload: ApplyFormInput): Promise<void> {
  const transporter = createGmailTransporter();

  const date = new Date().toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: TEACHER_EMAIL,
    subject: `Новая заявка на курс — ${payload.courseTitle || "Курс"} — Irina Exam Prep`,
    text: `${buildTeacherText(payload)}\n\nДата и время: ${date}`,
    html: `${buildTeacherHtml(payload)}<p style="margin-top:16px;color:#777;font-size:14px;">Дата и время: ${date}</p>`,
  });

  const coursesUrl = SITE_URL ? `${SITE_URL}${ROUTES.courses}` : ROUTES.courses;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: payload.email,
    subject: "Спасибо за заявку — Irina Exam Prep",
    text: `Здравствуйте, ${payload.firstName}!

Спасибо за выбор и заявку на курс. Мы свяжемся с вами в ближайшее время.

Оставайтесь на связи:

• Telegram-канал «Методика» (ELT Survival Guide): https://t.me/elt_survival_guide
• Личный канал в Telegram: https://t.me/Irina_Petrova_Eng
• Instagram: https://www.instagram.com/cambridge_exams_with_irina
• Курсы на сайте: ${coursesUrl.startsWith("http") ? coursesUrl : SITE_URL + coursesUrl}

С уважением,
Ирина Петрова
Irina Exam Prep`,
    html: `
        <div style="font-family: sans-serif; max-width: 560px; line-height: 1.6;">
          <p>Здравствуйте, <strong>${payload.firstName}</strong>!</p>
          <p>Спасибо за выбор и заявку на курс. Мы свяжемся с вами в ближайшее время.</p>
          <p><strong>Оставайтесь на связи:</strong></p>
          <ul style="margin: 16px 0;">
            <li>Telegram-канал «Методика» (ELT Survival Guide): <a href="https://t.me/elt_survival_guide">t.me/elt_survival_guide</a></li>
            <li>Личный канал в Telegram: <a href="https://t.me/Irina_Petrova_Eng">t.me/Irina_Petrova_Eng</a></li>
            <li>Instagram: <a href="https://www.instagram.com/cambridge_exams_with_irina?igsh=MXF2Z3V2bmFxZ3BtaQ==">instagram.com/cambridge_exams_with_irina</a></li>
            <li>Курсы на сайте: <a href="${coursesUrl.startsWith("http") ? coursesUrl : SITE_URL + coursesUrl}">Перейти к курсам</a></li>
          </ul>
          <p>С уважением,<br><strong>Ирина Петрова</strong><br>Irina Exam Prep</p>
        </div>
      `,
  });
}
