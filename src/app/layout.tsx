import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScroll from '@/components/ui/SmoothScroll';
import PageTransition from '@/components/ui/PageTransition';
import BackgroundSvg from '@/components/ui/BackgroundSvg';
import { ApplyModalProvider } from '@/components/ui/ApplyModalContext';
import CookieConsent from '@/components/ui/CookieConsent';

const sourceSans = Source_Sans_3({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Irina Petrova English Courses',
  description: 'Подготовка к экзаменам: курсы и методика',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`lenis ${sourceSans.variable} ${sourceSans.className}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <SmoothScroll>
          <ApplyModalProvider>
            <PageTransition>
              <BackgroundSvg />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieConsent />
            </PageTransition>
          </ApplyModalProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
