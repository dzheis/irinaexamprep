import { ROUTES } from "@/shared/constants/routes";
import { createGmailTransporter } from "@/infrastructure/email/gmailTransporter";

const NOTIFY_EMAIL = process.env["SUBSCRIPTION_NOTIFY_EMAIL"] || "dzheis@gmail.com";
const FROM_EMAIL = process.env["EMAIL_USER"];
const SITE_URL = process.env["NEXT_PUBLIC_SITE_URL"] || "";

export async function sendSubscribeNotificationEmails(subscriberEmail: string): Promise<void> {
  const transporter = createGmailTransporter();

  const date = new Date().toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: NOTIFY_EMAIL,
    subject: "Новый подписчик — Irina Exam Prep",
    text: `На вас подписался новый человек.\n\nАдрес почты подписчика: ${subscriberEmail}\nДата и время: ${date}`,
    html: `
        <p>На вас подписался новый человек.</p>
        <p><strong>Адрес почты подписчика:</strong> ${subscriberEmail}</p>
        <p><strong>Дата и время:</strong> ${date}</p>
      `,
  });

  const coursesUrl = SITE_URL ? `${SITE_URL}${ROUTES.courses}` : ROUTES.courses;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: subscriberEmail,
    subject: "Спасибо за подписку — Irina Exam Prep",
    text: `Здравствуйте!

Спасибо, что подписались на рассылку Irina Exam Preparation. Мы рады, что вы с нами.

Теперь вы будете среди первых получать советы по подготовке к экзаменам, полезные материалы и анонсы.

Оставайтесь на связи:

• Telegram-канал «Методика» (ELT Survival Guide): https://t.me/elt_survival_guide
• Личный канал в Telegram: https://t.me/Irina_Petrova_Eng
• Instagram: https://www.instagram.com/cambridge_exams_with_irina
• Курсы на сайте: ${coursesUrl.startsWith("http") ? coursesUrl : SITE_URL + coursesUrl}

Удачи в подготовке!

С уважением,
Ирина Петрова
Irina Exam Prep`,
    html: `
        <div style="font-family: sans-serif; max-width: 560px; line-height: 1.6;">
          <p>Здравствуйте!</p>
          <p>Спасибо, что подписались на рассылку <strong>Irina Exam Prep</strong>. Мы рады, что вы с нами.</p>
          <p>Теперь вы будете среди первых получать советы по подготовке к экзаменам, полезные материалы и анонсы.</p>
          <p><strong>Оставайтесь на связи:</strong></p>
          <ul style="margin: 16px 0;">
            <li>Telegram-канал «Методика» (ELT Survival Guide): <a href="https://t.me/elt_survival_guide">t.me/elt_survival_guide</a></li>
            <li>Личный канал в Telegram: <a href="https://t.me/Irina_Petrova_Eng">t.me/Irina_Petrova_Eng</a></li>
            <li>Instagram: <a href="https://www.instagram.com/cambridge_exams_with_irina?igsh=MXF2Z3V2bmFxZ3BtaQ==">instagram.com/cambridge_exams_with_irina</a></li>
            <li>Курсы на сайте: <a href="${coursesUrl.startsWith("http") ? coursesUrl : SITE_URL + coursesUrl}">Перейти к курсам</a></li>
          </ul>
          <p>Удачи в подготовке!</p>
          <p>С уважением,<br><strong>Ирина Петрова</strong><br>Irina Exam Prep</p>
        </div>
      `,
  });
}
