import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import PageTransition from "@/components/ui/PageTransition";
import BackgroundSvg from "@/components/ui/BackgroundSvg";
import { ApplyModalProvider } from "@/components/ui/ApplyModalContext";
import { CookieConsentProvider } from "@/components/ui/CookieConsentContext";
import { LanguageProvider } from "@/components/ui/LanguageContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getConfig, fetchStory } from "@/lib/storyblok";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "cyrillic"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Irina Petrova English Courses",
  description: "Подготовка к экзаменам: курсы и методика",
};

function linkToHref(link: unknown): string {
  if (typeof link === "string") return link.trim();
  if (link && typeof link === "object") {
    const o = link as { url?: string; cached_url?: string };
    return String(o.url ?? o.cached_url ?? "").trim();
  }
  return "";
}

function normalizeAnchorId(id: string | undefined): string | undefined {
  const s = id?.trim();
  if (!s) return undefined;
  return s.replace(/^#+/, "").replace(/^\/+/, "") || undefined;
}

function normalizeNavLinks(
  raw: { href?: unknown; link?: unknown; id?: string; label?: string }[] | undefined,
): { href: string; id?: string; label: string }[] {
  if (!Array.isArray(raw)) return [];
  const result = raw
    .map((item) => {
      const href = linkToHref(item.href ?? item.link) || "";
      const label = item.label?.trim() || "";
      if (!href || !label) return null;
      const id = normalizeAnchorId(item.id);
      return { href, id: id || undefined, label };
    })
    .filter((x): x is { href: string; id: string | undefined; label: string } => x !== null);
  return result as { href: string; id?: string; label: string }[];
}

async function getFooterCreditText(
  config: Awaited<ReturnType<typeof getConfig>>,
): Promise<string | undefined> {
  const fromConfig = config?.footer?.credit_text?.trim();
  if (fromConfig) return fromConfig;
  const home = await fetchStory<{ body?: { component?: string; credit_text?: string }[] }>("home");
  const body = home?.content?.body;
  if (!Array.isArray(body)) return undefined;
  const footerBlock = body.find((b) =>
    ["footer", "section_footer"].includes(String(b?.component ?? "").toLowerCase()),
  );
  const text = footerBlock?.credit_text;
  return typeof text === "string" ? text.trim() : undefined;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfig();
  const header = config?.header;
  const navLinks = normalizeNavLinks(
    header?.nav_links as
      | { href?: unknown; link?: unknown; id?: string; label?: string }[]
      | undefined,
  );
  const footerCreditText = await getFooterCreditText(config);

  return (
    <html
      lang="ru"
      className={`lenis ${sourceSans.variable} ${sourceSans.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <SmoothScroll>
          <LanguageProvider>
            <ApplyModalProvider>
              <Header
                {...(header?.logo_text?.trim() ? { logoText: header.logo_text.trim() } : {})}
                {...(header?.alt_text?.trim() ? { altText: header.alt_text.trim() } : {})}
                {...(navLinks.length > 0 ? { navLinks } : {})}
              />
              <CookieConsentProvider>
                <PageTransition>
                  <BackgroundSvg />
                  <main className="flex-1">{children}</main>
                  <Footer {...(footerCreditText !== undefined ? { creditText: footerCreditText } : {})} />
                </PageTransition>
              </CookieConsentProvider>
              <SpeedInsights />
            </ApplyModalProvider>
          </LanguageProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
