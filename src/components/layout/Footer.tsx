import Link from 'next/link';
import { memo } from 'react';
import FooterCredit from './FooterCredit';

const FOOTER_BTN_CLASS =
  'btn-secondary text-xs md:text-sm min-[1200px]:text-base !px-4 !py-2 min-[1200px]:!px-5 min-[1200px]:!py-2.5 no-underline';

const LEGAL = {
  type: 'ИП',
  fullName: 'Петрова Ирина Сергеевна',
  inn: '910219486600',
  ogrnip: '319911200092610',
  city: 'вставить город',
};

function Footer() {
  return (
    <footer className="nav border-t border-b-0 border-theme-light-bg/30 flex flex-col">
      <div className="container mx-auto px-6 pt-4 pb-4 w-full flex flex-col gap-3 min-[1280px]:flex-row min-[1280px]:items-center min-[1280px]:justify-between">
        <div className="flex flex-col items-center w-full min-[1280px]:items-start min-[1280px]:w-max">
          <div className="flex flex-col w-max gap-3">
            <div className="flex flex-wrap items-center justify-center min-[1280px]:justify-start gap-3 sm:gap-4 max-[500px]:grid max-[500px]:grid-cols-2 max-[500px]:w-max">
              <Link href="/offer" className={FOOTER_BTN_CLASS}>
                Публичная оферта
              </Link>
              <Link href="/payment-refund" className={FOOTER_BTN_CLASS}>
                Оплата и возврат
              </Link>
              <Link href="/privacy" className={`${FOOTER_BTN_CLASS} max-[500px]:col-span-2 max-[500px]:justify-self-center`}>
                Политика конфиденциальности
              </Link>
            </div>
            <p className="text-xs text-theme/80 text-center w-0 min-w-full">
              {LEGAL.type} {LEGAL.fullName}, ИНН {LEGAL.inn}, ОГРНИП {LEGAL.ogrnip}. {LEGAL.city}.
            </p>
          </div>
        </div>
        <div className="w-full flex justify-center items-center min-[1280px]:w-auto min-[1280px]:justify-end">
          <FooterCredit />
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
