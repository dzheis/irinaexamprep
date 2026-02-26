import type { Metadata } from 'next';
import { Playpen_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScroll from '@/components/ui/SmoothScroll';
import PageTransition from '@/components/ui/PageTransition';
import BackgroundSvg from '@/components/ui/BackgroundSvg';
import { ApplyModalProvider } from '@/components/ui/ApplyModalContext';
import CookieConsent from '@/components/ui/CookieConsent';

const playpenSans = Playpen_Sans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playpen',
  display: 'optional',
});

export const metadata: Metadata = {
  title: 'Irina Petrova English Courses',
  description: 'Подготовка к экзаменам: курсы и методика',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`lenis ${playpenSans.variable} ${playpenSans.className}`}>
      <body className="min-h-screen flex flex-col antialiased">
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