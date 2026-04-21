import type { NextConfig } from "next";

const isProd = process.env["NODE_ENV"] === "production";

/**
 * Content-Security-Policy.
 *
 * Design notes:
 *   - `'unsafe-inline'` + `'unsafe-eval'` are included for script-src because Next.js App Router
 *     ships inline bootstrap scripts and dev-mode HMR uses eval. Moving to nonces would require
 *     a middleware refactor and is intentionally out of scope for this pass.
 *   - External origins are pinned to the exact hosts the app actually talks to (Supabase,
 *     Storyblok, YouTube, Robokassa, Vercel analytics). Any new third-party must be added here.
 *   - `img-src https:` is pragmatic: images cannot execute scripts, and the CMS may emit
 *     thumbnails from several CDNs. Tighten later if the CMS is locked to one host.
 *   - `form-action` whitelists Robokassa so that any future `<form>`-based payment submission
 *     keeps working; the current flow uses `window.location.href` which is unaffected.
 */
const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://va.vercel-scripts.com",
    "https://vercel.live",
    "https://challenges.cloudflare.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://api.storyblok.com",
    "https://api-eu.storyblok.com",
    "https://api-us.storyblok.com",
    "https://a.storyblok.com",
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
    "https://vercel.live",
  ],
  "media-src": ["'self'", "blob:", "https:"],
  "frame-src": [
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://auth.robokassa.ru",
    "https://*.robokassa.ru",
    "https://vercel.live",
    "https://challenges.cloudflare.com",
  ],
  "frame-ancestors": ["'self'"],
  "form-action": ["'self'", "https://auth.robokassa.ru", "https://*.robokassa.ru"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  ...(isProd ? { "upgrade-insecure-requests": [] } : {}),
};

function serializeCsp(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          {
            key: "Permissions-Policy",
            value:
              'picture-in-picture=(self "https://www.youtube.com" "https://www.youtube-nocookie.com"), camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          { key: "Content-Security-Policy", value: serializeCsp() },
        ],
      },
    ];
  },
};

export default nextConfig;
