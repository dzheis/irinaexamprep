"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import AnimatedButtonText from "@/components/ui/AnimatedButtonText";
import { useScrollToSection, useScrollToTop } from "@/components/ui/SmoothScroll";
import { useApplyModal } from "@/components/ui/ApplyModalContext";
import AuthHeaderBlock from "@/components/layout/AuthHeaderBlock";

const DEFAULT_LOGO = "Irina Petrova";
const DEFAULT_ALT = "Best Practices for Learning English";

const DEFAULT_NAV_LINKS: { href: string; id?: string; label: string }[] = [
  { href: "/#about", id: "about", label: "About me" },
  { href: "/courses", label: "Language Courses" },
  { href: "/methodology", label: "Methodology" },
  { href: "/free-resources", label: "Free resources" },
  { href: "/#cta", id: "cta", label: "Contacts" },
];

const STAGGER = 0.045;

function CellChar({ char }: { char: string }) {
  return char === " " ? "\u00A0" : char;
}

const SCROLL_TO_SECTION_KEY = "scrollToSection";

function isNavLinkActive(href: string, pathname: string): boolean {
  const path = href.split("#")[0]?.split("?")[0] ?? "";
  if (href.includes("#") && (path === "/" || path === "")) return false;
  if (!path || path === "/") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

type HeaderProps = {
  logoText?: string;
  altText?: string;
  navLinks?: { href: string; id?: string; label: string }[];
};

export default function Header({
  logoText: logoTextProp,
  altText: altTextProp,
  navLinks: navLinksProp,
}: HeaderProps = {}) {
  const logoText = logoTextProp?.trim() || DEFAULT_LOGO;
  const altText = altTextProp?.trim() || DEFAULT_ALT;
  const navLinks = navLinksProp?.length ? navLinksProp : DEFAULT_NAV_LINKS;
  const CHARS1 = logoText.split("");
  const CHARS2 = altText.split("");
  const LEN1 = CHARS1.length;
  const LEN2 = CHARS2.length;

  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const scrollToSection = useScrollToSection();
  const scrollToTop = useScrollToTop();
  const applyModal = useApplyModal();
  const letter1Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const letter2Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const logoAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const hasRunOnceRef = useRef(false);
  const isShowingAltRef = useRef(false);

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
    const a1 = letter1Refs.current.filter(Boolean) as HTMLSpanElement[];
    const a2 = letter2Refs.current.filter(Boolean) as HTMLSpanElement[];
    if (a1.length < LEN1 || a2.length < LEN2 || hasRunOnceRef.current) return;
    hasRunOnceRef.current = true;
    runLogoAnimation(0.3);
    return () => {
      if (logoAnimationRef.current) logoAnimationRef.current.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run logo animation once on mount
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

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCapture = (e: MouseEvent) => {
      const target = e.target as Node;
      if (mobileMenuRef.current?.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleCapture, true);
    return () => document.removeEventListener("click", handleCapture, true);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 nav overflow-x-visible ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="w-full max-w-[1550px] mx-auto px-6 py-4 box-border min-h-[4.5rem]">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="relative text-base md:text-lg min-[1200px]:text-xl min-[1200px]:md:text-2xl font-semibold tracking-tight text-theme inline-flex flex-nowrap whitespace-nowrap flex-shrink-0"
            onMouseEnter={handleLogoMouseEnter}
            onClick={(e) => {
              if (pathname === "/" && scrollToTop) {
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
                    <CellChar char={CHARS2[i]} />
                  </span>
                  <span
                    ref={(el) => {
                      letter2Refs.current[i] = el;
                    }}
                    className="absolute left-0 top-0 overflow-hidden opacity-0 max-w-full"
                    aria-hidden="true"
                  >
                    <CellChar char={CHARS2[i]} />
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
                    <CellChar char={CHARS1[i]} />
                  </span>
                  <span
                    ref={(el) => {
                      letter1Refs.current[i] = el;
                    }}
                    className="absolute left-0 top-0 overflow-hidden max-w-full"
                  >
                    <CellChar char={CHARS1[i]} />
                  </span>
                </span>
              ))}
            </span>
          </Link>

          <div className="header-nav-right hidden min-[1270px]:flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end text-xs sm:text-sm min-[1200px]:text-base">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 overflow-visible py-2">
              {navLinks.map(({ href, id, label }, index) => (
                <Link
                  key={`nav-${index}-${href}-${label}`}
                  href={href}
                  className={`nav-link flex-shrink-0${isNavLinkActive(href, pathname) ? " nav-link--active" : ""}`}
                  onClick={(e) => {
                    if (id != null) {
                      if (pathname === "/" && scrollToSection) {
                        e.preventDefault();
                        scrollToSection(id);
                      } else if (pathname !== "/") {
                        e.preventDefault();
                        if (typeof window !== "undefined") {
                          sessionStorage.setItem(SCROLL_TO_SECTION_KEY, id);
                        }
                        router.push("/");
                      }
                    }
                  }}
                >
                  <AnimatedButtonText text={label} />
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 pl-1 sm:pl-2">
              <button
                type="button"
                className="btn-secondary !px-4 !py-2 !text-sm min-[1200px]:!px-7 min-[1200px]:!py-3 min-[1200px]:!text-lg flex-shrink-0"
                aria-label="Apply"
                onClick={() => {
                  applyModal?.openApplyModal(0, "Заявка");
                }}
              >
                <AnimatedButtonText text="Apply" />
              </button>
              <AuthHeaderBlock className="flex" variant="desktop" />
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
          ref={mobileMenuRef}
          className={`min-[1270px]:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 pb-4 items-center">
            {navLinks.map(({ href, id, label }, index) => (
              <Link
                key={`nav-mobile-${index}-${href}-${label}`}
                href={href}
                className={`nav-link py-2${isNavLinkActive(href, pathname) ? " nav-link--active" : ""}`}
                onClick={(e) => {
                  if (id != null) {
                    if (pathname === "/" && scrollToSection) {
                      e.preventDefault();
                      scrollToSection(id);
                    } else if (pathname !== "/") {
                      e.preventDefault();
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem(SCROLL_TO_SECTION_KEY, id);
                      }
                      router.push("/");
                    }
                  }
                  closeMenu();
                }}
              >
                <AnimatedButtonText text={label} />
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
              <AnimatedButtonText text="Apply" />
            </button>
            <div className="flex items-center justify-center w-full px-4">
              <AuthHeaderBlock className="flex" variant="mobile" />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
