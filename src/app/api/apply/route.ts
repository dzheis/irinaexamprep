import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const TEACHER_EMAIL = process.env["APPLY_NOTIFY_EMAIL"] || "dzheis@gmail.com";
const FROM_EMAIL = process.env["EMAIL_USER"];
const SITE_URL = process.env["NEXT_PUBLIC_SITE_URL"] || "";

const TEXT_ONLY_REGEX = /^[a-zA-Zа-яА-ЯёЁ\s\-']*$/;

type ApplyBody = {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  telegram?: string;
  instagram?: string;
  whatsapp?: string;
  courseId: number;
  courseTitle?: string;
};

function buildTeacherText(data: ApplyBody): string {
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

function buildTeacherHtml(data: ApplyBody): string {
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

export async function POST(req: NextRequest) {
  try {
    if (!process.env["EMAIL_USER"] || !process.env["EMAIL_PASS"]) {
      console.error("Apply: EMAIL_USER or EMAIL_PASS not set");
      return NextResponse.json(
        { success: false, error: "Сервис заявок временно недоступен." },
        { status: 503 },
      );
    }

    const body = (await req.json()) as ApplyBody;
    const {
      firstName,
      lastName,
      middleName,
      email,
      telegram,
      instagram,
      whatsapp,
      courseId,
      courseTitle,
    } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Имя и фамилия обязательны" },
        { status: 400 },
      );
    }
    if (!TEXT_ONLY_REGEX.test(firstName.trim()) || !TEXT_ONLY_REGEX.test(lastName.trim())) {
      return NextResponse.json(
        { success: false, error: "Имя и фамилия должны содержать только текст" },
        { status: 400 },
      );
    }
    if (middleName?.trim() && !TEXT_ONLY_REGEX.test(middleName.trim())) {
      return NextResponse.json(
        { success: false, error: "Отчество должно содержать только текст" },
        { status: 400 },
      );
    }

    const trimmedEmail = (email || "").trim().toLowerCase();
    if (!trimmedEmail) {
      return NextResponse.json({ success: false, error: "Email обязателен" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ success: false, error: "Некорректный email" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env["EMAIL_USER"], pass: process.env["EMAIL_PASS"] },
    });

    const date = new Date().toLocaleString("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const payload: ApplyBody = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: trimmedEmail,
      courseId: Number(courseId) || 0,
      ...(middleName?.trim() ? { middleName: middleName.trim() } : {}),
      ...(telegram?.trim() ? { telegram: telegram.trim() } : {}),
      ...(instagram?.trim() ? { instagram: instagram.trim() } : {}),
      ...(whatsapp?.trim() ? { whatsapp: whatsapp.trim() } : {}),
      ...(courseTitle?.trim() ? { courseTitle: courseTitle.trim() } : {}),
    };

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: TEACHER_EMAIL,
      subject: `Новая заявка на курс — ${payload.courseTitle || "Курс"} — Irina Exam Prep`,
      text: `${buildTeacherText(payload)}\n\nДата и время: ${date}`,
      html: `${buildTeacherHtml(payload)}<p style="margin-top:16px;color:#777;font-size:14px;">Дата и время: ${date}</p>`,
    });

    const coursesUrl = SITE_URL ? `${SITE_URL}/courses` : "/courses";

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: trimmedEmail,
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Apply API error:", err);
    return NextResponse.json(
      { success: false, error: "Не удалось отправить заявку. Попробуйте позже." },
      { status: 500 },
    );
  }
}
