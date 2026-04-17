"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Tooltip from "@/components/ui/Tooltip";
import { ROUTES } from "@/presentation/routes";
import { useLanguage } from "@/components/ui/LanguageContext";
import { useUser } from "@/hooks/useUser";

const EMAIL_STYLE_LIKE_NAV =
  "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-theme-accent bg-transparent";

const AUTH_ICON_BTN =
  "auth-header-icon-btn flex flex-shrink-0 items-center justify-center w-9 h-9 min-[1200px]:w-10 min-[1200px]:h-10 rounded-full text-theme/80";

const AUTH_ICON_GLYPH = "relative z-[1] w-5 h-5 min-[1200px]:w-6 min-[1200px]:h-6";

const SIGNUP_TOOLTIP_LABEL = "Sign\nup";
const MOBILE_ACTION_TEXT = "text-sm font-semibold text-[#5e6f86]";

export default function AuthHeaderBlock({
  className = "",
  variant = "desktop",
}: {
  className?: string;
  variant?: "desktop" | "mobile";
}) {
  const { localizeText } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user, refetch } = useUser([pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    refetch();
    router.push(ROUTES.home);
    router.refresh();
  };

  if (user?.email) {
    const isMobile = variant === "mobile";
    return (
      <div className={`flex items-center gap-2 min-w-0 ${className}`}>
        <span
          className={
            isMobile
              ? `${EMAIL_STYLE_LIKE_NAV} min-w-0 truncate max-w-[200px] sm:max-w-[240px]`
              : "inline-flex items-center rounded-full px-3 py-1.5 min-[1200px]:px-4 min-[1200px]:py-2 text-sm min-[1200px]:text-base font-semibold text-theme truncate max-w-[120px] min-[1200px]:max-w-[180px]"
          }
          title={user.email}
        >
          {user.email}
        </span>
        {isMobile ? (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2"
            aria-label={localizeText("Выйти")}
          >
            <span className={AUTH_ICON_BTN}>
              <svg
                className={AUTH_ICON_GLYPH}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className={MOBILE_ACTION_TEXT}>{localizeText("Выйти")}</span>
          </button>
        ) : (
          <Tooltip label={localizeText("Выйти")}>
            <button
              type="button"
              onClick={handleLogout}
              className={AUTH_ICON_BTN}
              aria-label={localizeText("Выйти")}
            >
              <svg
                className={AUTH_ICON_GLYPH}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>
    );
  }

  const isMobile = variant === "mobile";

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      {isMobile ? (
        <>
          <Link href={ROUTES.login} className="inline-flex items-center gap-2 no-underline" aria-label={localizeText("Log in")}>
            <span className={AUTH_ICON_BTN}>
              <svg
                className={AUTH_ICON_GLYPH}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </span>
            <span className={MOBILE_ACTION_TEXT}>{localizeText("Log in")}</span>
          </Link>
          <Link href={ROUTES.signup} className="inline-flex items-center gap-2 no-underline" aria-label={localizeText("Sign up")}>
            <span className={AUTH_ICON_BTN}>
              <svg
                className={AUTH_ICON_GLYPH}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </span>
            <span className={MOBILE_ACTION_TEXT}>{localizeText("Sign up")}</span>
          </Link>
        </>
      ) : (
        <>
          <Tooltip label={localizeText("Log in")}>
            <Link
              href={ROUTES.login}
              className={`${AUTH_ICON_BTN} no-underline`}
              aria-label={localizeText("Log in")}
            >
              <svg
                className={AUTH_ICON_GLYPH}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </Link>
          </Tooltip>
          <Tooltip label={localizeText(SIGNUP_TOOLTIP_LABEL)}>
            <Link
              href={ROUTES.signup}
              className={`${AUTH_ICON_BTN} no-underline`}
              aria-label={localizeText("Sign up")}
            >
              <svg
                className={AUTH_ICON_GLYPH}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </Link>
          </Tooltip>
        </>
      )}
    </div>
  );
}
