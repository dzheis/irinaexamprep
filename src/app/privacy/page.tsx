import type { Metadata } from "next";
import Link from "next/link";
import { renderRichText } from "@storyblok/react";
import { getTextPageFromStoryblok } from "@/infrastructure/storyblok/textPageStoryblok";
import { sanitizeCmsHtml } from "@/infrastructure/security/sanitizeHtml";
import { ROUTES } from "@/shared/constants/routes";

export const metadata: Metadata = {
  title: "Политика конфиденциальности и обработки персональных данных | Irina Exam Prep",
  description:
    "Политика обработки персональных данных в соответствии с ФЗ-152. Конфиденциальность и cookie на сайте Irina Exam Prep",
};

const DEFAULT_TITLE = "Политика конфиденциальности и обработки персональных данных";
const SUBTITLE_CLASS = "font-normal text-theme-accent mb-6 text-justify";

export default async function PrivacyPage() {
  const data = await getTextPageFromStoryblok("privacy", DEFAULT_TITLE);
  const subtitle1 = data.customFields?.["subtitle_1"];
  const subtitle2 = data.customFields?.["subtitle_2"];
  const footerTitle = data.customFields?.["footer_title"];
  const rawContentHtml =
    data.contentRichText != null
      ? ((renderRichText(
          data.contentRichText as unknown as Parameters<typeof renderRichText>[0],
        ) as string | undefined) ?? "")
      : null;
  const contentHtml = rawContentHtml != null ? sanitizeCmsHtml(rawContentHtml) : null;

  return (
    <div className="min-h-screen">
      <div className="pt-24 md:pt-28 pb-16">
        <article className="max-w-3xl mx-auto px-6 text-theme">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{data.title}</h1>

          {contentHtml ? (
            <>
              {subtitle1 != null && <h2 className={SUBTITLE_CLASS}>{String(subtitle1)}</h2>}
              {subtitle2 != null && <h2 className={SUBTITLE_CLASS}>{String(subtitle2)}</h2>}
              <section
                className="prose prose-theme max-w-none text-theme space-y-6 [&_p]:text-justify [&_ul]:text-justify [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
              {footerTitle != null && (
                <h2 className={`${SUBTITLE_CLASS} mt-12`}>{String(footerTitle)}</h2>
              )}
            </>
          ) : (
            <PrivacyStaticContent />
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={ROUTES.home}
              className="btn-secondary !px-5 !py-2.5 text-sm md:text-base no-underline inline-flex items-center gap-2"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function PrivacyStaticContent() {
  return (
    <>
      <p className="text-sm text-theme-accent mb-6 text-justify">
        Настоящий документ является политикой обработки персональных данных в соответствии с
        Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок
        обработки персональных данных, а также использования файлов cookie на сайте. Размещение
        данного документа на сайте обязательно в случаях, когда у пользователей запрашиваются
        персональные данные (в т.ч. e-mail, телефон, имя).
      </p>
      <p className="text-sm text-theme-accent mb-8 text-justify">
        Обработка персональных данных осуществляется в соответствии с ФЗ-152 и действующим
        законодательством РФ.
      </p>
      <section className="prose prose-theme max-w-none text-theme space-y-6 [&_p]:text-justify [&_ul]:text-justify">
        <h2 className="text-xl font-bold mt-8 mb-2">1. Оператор персональных данных</h2>
        <p>
          Оператором персональных данных является владелец сайта (Исполнитель): лицо, указанное в
          разделе «Реквизиты» публичной оферты и в платёжных документах. Контактные данные для
          обращений по вопросам персональных данных размещены на сайте.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">2. Состав и цели обработки данных</h2>
        <p>
          Могут собираться: имя, фамилия, отчество, адрес электронной почты, номер телефона,
          никнеймы в мессенджерах (по желанию пользователя), данные, автоматически передаваемые при
          посещении сайта (IP, тип браузера, cookie). Цели обработки: заключение и исполнение
          договора оказания услуг, связь с пользователем, рассылка информационных материалов (при
          согласии), улучшение работы сайта, исполнение требований законодательства.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">3. Правовые основания и сроки</h2>
        <p>
          Обработка осуществляется на основании согласия субъекта персональных данных, исполнения
          договора и законных интересов оператора. Срок хранения данных — не дольше, чем необходимо
          для указанных целей, либо в пределах сроков, установленных законодательством (в т.ч. для
          хранения документов и разрешения споров).
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">4. Передача данных третьим лицам</h2>
        <p>
          Персональные данные не передаются третьим лицам в маркетинговых целях. Передача возможна:
          платёжным системам (в т.ч. Robokassa) для проведения оплаты; хостингу и техническим
          сервисам в объёме, необходимом для работы сайта; государственным органам при наличии
          законного требования.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">5. Файлы cookie и технологии сайта</h2>
        <p>
          Сайт может использовать файлы cookie и аналогичные технологии для обеспечения работы
          сайта, запоминания настроек и анализа посещаемости. Использование сайта после ознакомления
          с уведомлением о cookie при первом посещении означает согласие на использование cookie в
          соответствии с настоящей политикой. Отключение cookie в браузере может ограничить
          функциональность сайта.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">6. Права субъекта персональных данных</h2>
        <p>
          Пользователь вправе запросить доступ к своим данным, их уточнение, блокирование или
          уничтожение, а также отозвать согласие на обработку, направив запрос оператору по
          контактам, указанным на сайте. Оператор рассматривает запрос в сроки, установленные
          законодательством.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-2">7. Безопасность и изменения политики</h2>
        <p>
          Оператор принимает меры для защиты персональных данных от неправомерного доступа и утраты.
          Актуальная редакция политики конфиденциальности размещена на данной странице. Продолжение
          использования сайта после внесения изменений означает принятие обновлённой политики.
        </p>
      </section>
      <p className="mt-12 text-sm text-theme-accent text-justify">
        По вопросам обработки персональных данных и политики конфиденциальности обращайтесь по
        контактам, указанным на сайте.
      </p>
    </>
  );
}
