"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import AnimatedButtonText from "@/components/ui/AnimatedButtonText";
import { useScrollToSection, useScrollToTop } from "@/components/ui/SmoothScroll";
import { useApplyModal } from "@/components/ui/ApplyModalContext";
import { useLanguage } from "@/components/ui/LanguageContext";
import AuthHeaderBlock from "@/components/layout/AuthHeaderBlock";
import { HOME_HASH, ROUTES } from "@/shared/constants/routes";

const DEFAULT_LOGO = "Irina Petrova";
const DEFAULT_ALT = "Best Practices for Learning English";

const DEFAULT_NAV_LINKS: { href: string; id?: string; label: string }[] = [
  { href: HOME_HASH.about, id: "about", label: "About me" },
  { href: ROUTES.courses, label: "Language Courses" },
  { href: ROUTES.methodology, label: "Methodology" },
  { href: ROUTES.freeResources, label: "Free resources" },
  { href: HOME_HASH.cta, id: "cta", label: "Contacts" },
];

const STAGGER = 0.045;

function CellChar({ char }: { char: string }) {
  return char === " " ? "\u00A0" : char;
}

const SCROLL_TO_SECTION_KEY = "scrollToSection";

function isNavLinkActive(href: string, pathname: string): boolean {
  const path = href.split("#")[0]?.split("?")[0] ?? "";
  if (href.includes("#") && (path === ROUTES.home || path === "")) return false;
  if (!path || path === ROUTES.home) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

type HeaderProps = {
  logoText?: string;
  altText?: string;
  navLinks?: { href: string; id?: string; label: string }[];
};

function LanguageDropdown({
  language,
  onChange,
}: {
  language: "en" | "ru";
  onChange: (lang: "en" | "ru") => void;
}) {
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Record<"en" | "ru", HTMLButtonElement | null>>({ en: null, ru: null });
  const closeTimerRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);

  const openMenu = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
    setOpen(true);
    setIsActive(false);
    enterTimerRef.current = window.setTimeout(() => {
      setIsActive(true);
    }, 10);
  };

  const closeMenu = () => {
    if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
    setIsActive(false);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target)) closeMenu();
    };
    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("click", onDocClick);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open || !isActive) return;
    const targetLang: "en" | "ru" = language === "en" ? "ru" : "en";
    const target = optionRefs.current[targetLang];
    if (!target) return;

    gsap.killTweensOf(target);
    gsap.fromTo(
      target,
      { y: 0 },
      {
        y: -4,
        duration: 0.18,
        repeat: 3,
        yoyo: true,
        ease: "power2.out",
      },
    );

    return () => {
      gsap.killTweensOf(target);
      gsap.set(target, { y: 0 });
    };
  }, [open, isActive, language]);

  const handleToggle = () => {
    if (open) {
      closeMenu();
      return;
    }
    openMenu();
  };

  const handleSelect = (lang: "en" | "ru") => {
    onChange(lang);
    closeMenu();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="btn-secondary relative !px-3 !py-2 !text-xs min-[1200px]:!text-sm min-w-[66px] inline-flex items-center justify-center !text-[#5e6f86]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Language menu"
      >
        <AnimatedButtonText text={language.toUpperCase()} />
        <span
          className={`absolute right-2 transition-transform duration-200 ${
            open && isActive ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute left-0 top-[calc(100%+8px)] w-full glass rounded-xl p-1 z-[60] shadow-md border border-theme-secondary-accent/25 origin-top transition-all duration-180 ${
            isActive
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }`}
        >
          {(["en", "ru"] as const).map((lang) => (
            <button
              key={lang}
              ref={(el) => {
                optionRefs.current[lang] = el;
              }}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(lang)}
              className={`w-full text-center rounded-full px-3 py-1.5 text-xs min-[1200px]:text-sm transition-colors ${
                language === lang
                  ? "bg-theme-secondary-accent/20 text-[#5e6f86] font-semibold"
                  : "text-[#5e6f86] hover:bg-theme-secondary-accent/10"
              }`}
            >
              <AnimatedButtonText text={lang.toUpperCase()} className="justify-center w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({
  logoText: logoTextProp,
  altText: altTextProp,
  navLinks: navLinksProp,
}: HeaderProps = {}) {
  const { language, setLanguage, localizeText } = useLanguage();
  const logoText = logoTextProp?.trim() || DEFAULT_LOGO;
  const altText = altTextProp?.trim() || DEFAULT_ALT;
  const navLinks = navLinksProp?.length ? navLinksProp : DEFAULT_NAV_LINKS;
  const localizedNavLinks = navLinks.map((link) => ({ ...link, label: localizeText(link.label) }));
  const CHARS1 = logoText.split("");
  const CHARS2 = altText.split("");
  const LEN1 = CHARS1.length;
  const LEN2 = CHARS2.length;

  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuMaxHeight, setMobileMenuMaxHeight] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const scrollToSection = useScrollToSection();
  const scrollToTop = useScrollToTop();
  const applyModal = useApplyModal();
  const letter1Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const letter2Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const logoAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const isShowingAltRef = useRef(false);
  const mobileMenuInnerRef = useRef<HTMLDivElement>(null);

  const prevScrolledRef = useRef(false);
  useEffect(() => {
    const handleScroll = () => {
      const now = window.scrollY > 20;
      if (now !== prevScrolledRef.current) {
        prevScrolledRef.current = now;
        setScrolled(now);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const runLogoAnimation = (delay = 0) => {
    const a1 = letter1Refs.current.filter(Boolean) as HTMLSpanElement[];
    const a2 = letter2Refs.current.filter(Boolean) as HTMLSpanElement[];
    if (a1.length < LEN1 || a2.length < LEN2) return;

    if (logoAnimationRef.current?.isActive()) return;

    gsap.set(a2, { opacity: 0 });
    gsap.set(a1, { opacity: 1 });
    isShowingAltRef.current = false;

    const tl = gsap
      .timeline({ delay })
      .to(a1, {
        opacity: 0,
        duration: 0.2,
        stagger: STAGGER,
        ease: "power2.in",
      })
      .to(
        a2,
        {
          opacity: 1,
          duration: 0.22,
          stagger: STAGGER,
          ease: "power2.out",
        },
        "<",
      )
      .add(() => {
        isShowingAltRef.current = true;
      }, ">")
      .to({}, { duration: 1.5 })
      .to(a2, {
        opacity: 0,
        duration: 0.2,
        stagger: { each: STAGGER, from: "end" },
        ease: "power2.in",
      })
      .to(a1, {
        opacity: 1,
        duration: 0.22,
        stagger: STAGGER,
        ease: "power2.out",
      })
      .add(() => {
        isShowingAltRef.current = false;
        logoAnimationRef.current = null;
      }, ">");

    logoAnimationRef.current = tl;
  };

  useEffect(() => {
    return () => {
      if (logoAnimationRef.current) logoAnimationRef.current.kill();
    };
  }, []);

  const handleLogoMouseEnter = () => {
    if (isShowingAltRef.current) return;
    runLogoAnimation(0);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const t = window.setTimeout(() => setIsMenuOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const recalcHeight = () => {
      const h = mobileMenuInnerRef.current?.scrollHeight ?? 0;
      setMobileMenuMaxHeight(h);
    };
    recalcHeight();
    window.addEventListener("resize", recalcHeight);
    return () => window.removeEventListener("resize", recalcHeight);
  }, [isMenuOpen, language, pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 nav overflow-x-visible ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="w-full max-w-[1550px] mx-auto px-6 py-4 box-border min-h-[4.5rem]">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <Link
            href={ROUTES.home}
            className="relative text-base md:text-lg min-[1200px]:text-xl min-[1200px]:md:text-2xl font-semibold tracking-tight text-theme inline-flex flex-nowrap whitespace-nowrap flex-shrink-0"
            onMouseEnter={handleLogoMouseEnter}
            onClick={(e) => {
              if (pathname === ROUTES.home && scrollToTop) {
                e.preventDefault();
                scrollToTop();
              }
            }}
          >
            <span className="inline-flex flex-nowrap">
              {CHARS2.map((_, i) => (
                <span
                  key={`2-${i}`}
                  className={`relative inline-block align-baseline overflow-hidden ${CHARS2[i] === " " ? "char-space" : ""}`}
                >
                  <span className="invisible select-none font-inherit" aria-hidden>
                    <CellChar char={CHARS2[i] ?? ""} />
                  </span>
                  <span
                    ref={(el) => {
                      letter2Refs.current[i] = el;
                    }}
                    className="absolute left-0 top-0 overflow-hidden opacity-0 max-w-full"
                    aria-hidden="true"
                  >
                    <CellChar char={CHARS2[i] ?? ""} />
                  </span>
                </span>
              ))}
            </span>
            <span className="absolute left-0 top-0 inline-flex flex-nowrap">
              {CHARS1.map((_, i) => (
                <span
                  key={`1-${i}`}
                  className={`relative inline-block align-baseline overflow-hidden ${CHARS1[i] === " " ? "char-space" : ""}`}
                >
                  <span className="invisible select-none font-inherit" aria-hidden>
                    <CellChar char={CHARS1[i] ?? ""} />
                  </span>
                  <span
                    ref={(el) => {
                      letter1Refs.current[i] = el;
                    }}
                    className="absolute left-0 top-0 overflow-hidden max-w-full"
                  >
                    <CellChar char={CHARS1[i] ?? ""} />
                  </span>
                </span>
              ))}
            </span>
          </Link>

          <div className="header-nav-right hidden min-[1270px]:flex items-center gap-2 sm:gap-3 max-[1380px]:gap-1.5 max-[1380px]:sm:gap-2 min-w-0 flex-1 justify-end text-xs sm:text-sm min-[1200px]:text-base">
            <div className="flex items-center gap-1 sm:gap-2 max-[1380px]:gap-0.5 max-[1380px]:sm:gap-1 min-w-0 overflow-visible py-2">
              {navLinks.map(({ href, id, label }, index) => (
                <Link
                  key={`nav-${index}-${href}-${label}`}
                  href={href}
                  className={`nav-link !text-[#5e6f86] flex-shrink-0 max-[1380px]:!px-1${isNavLinkActive(href, pathname) ? " nav-link--active" : ""}`}
                  onClick={(e) => {
                    if (id != null) {
                      if (pathname === ROUTES.home && scrollToSection) {
                        e.preventDefault();
                        scrollToSection(id);
                      } else if (pathname !== ROUTES.home) {
                        e.preventDefault();
                        if (typeof window !== "undefined") {
                          sessionStorage.setItem(SCROLL_TO_SECTION_KEY, id);
                        }
                        router.push(ROUTES.home);
                      }
                    }
                  }}
                >
                  <AnimatedButtonText text={localizedNavLinks[index]?.label ?? label} />
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 max-[1380px]:gap-1.5 max-[1380px]:sm:gap-2 flex-shrink-0 pl-1 sm:pl-2 max-[1380px]:pl-0.5 max-[1380px]:sm:pl-1">
              <button
                type="button"
                className="btn-secondary !px-4 !py-2 !text-sm min-[1200px]:!px-7 min-[1200px]:!py-3 min-[1200px]:!text-lg max-[1380px]:!px-3.5 max-[1380px]:!py-2 max-[1380px]:!text-sm flex-shrink-0"
                aria-label="Apply"
                onClick={() => {
                  applyModal?.openApplyModal(0, "Заявка");
                }}
              >
                <AnimatedButtonText text={localizeText("Apply")} />
              </button>
              <AuthHeaderBlock className="flex" variant="desktop" />
              <LanguageDropdown language={language} onChange={setLanguage} />
            </div>
          </div>

          <button
            onClick={toggleMenu}
            className="header-nav-right min-[1270px]:hidden flex flex-col gap-1.5 p-2 text-theme"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-6 transition-all duration-300 bg-current ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 transition-all duration-300 bg-current ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 transition-all duration-300 bg-current ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        <div
          className={`min-[1270px]:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "opacity-100 mt-4 overflow-visible" : "opacity-0 mt-0 overflow-hidden"
          }`}
          style={{ maxHeight: isMenuOpen ? `${mobileMenuMaxHeight}px` : "0px" }}
        >
          <div ref={mobileMenuInnerRef} className="flex flex-col gap-4 pb-4 items-center">
            {navLinks.map(({ href, id, label }, index) => (
              <Link
                key={`nav-mobile-${index}-${href}-${label}`}
                href={href}
                className={`nav-link !text-[#5e6f86] py-2${isNavLinkActive(href, pathname) ? " nav-link--active" : ""}`}
                onClick={(e) => {
                  if (id != null) {
                    if (pathname === ROUTES.home && scrollToSection) {
                      e.preventDefault();
                      scrollToSection(id);
                    } else if (pathname !== ROUTES.home) {
                      e.preventDefault();
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem(SCROLL_TO_SECTION_KEY, id);
                      }
                      router.push(ROUTES.home);
                    }
                  }
                  closeMenu();
                }}
              >
                <AnimatedButtonText text={localizedNavLinks[index]?.label ?? label} />
              </Link>
            ))}
            <button
              type="button"
              className="btn-secondary py-2"
              aria-label="Apply"
              onClick={() => {
                applyModal?.openApplyModal(0, "Заявка");
                closeMenu();
              }}
            >
              <AnimatedButtonText text={localizeText("Apply")} />
            </button>
            <div className="flex items-center justify-center w-full px-4">
              <AuthHeaderBlock className="flex" variant="mobile" />
            </div>
            <LanguageDropdown language={language} onChange={setLanguage} />
          </div>
        </div>
      </nav>
    </header>
  );
}
