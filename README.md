# Irina Exam Prep

Next.js application for an English exam preparation business: marketing and methodology content, Supabase-backed authentication, Robokassa payments for digital methodology access, Storyblok CMS for editable pages, and transactional email (newsletter and course applications). The codebase follows Clean Architecture with explicit layer boundaries.

---

## Architecture Overview

**Dependency direction (strict):** `PRESENTATION` → `APPLICATION` → (`DOMAIN` + `INFRASTRUCTURE` / IO adapters). `DOMAIN` imports neither application nor presentation nor framework IO.

```text
  PRESENTATION (app/, components/, hooks/)
        │
        ▼
  APPLICATION (application/ — use cases)
        │
        ├──────────► DOMAIN (domain/ — policies, pure rules)
        │
        └──────────► INFRASTRUCTURE (infrastructure/) + services/ + lib/
                     (email, crypto helpers, Supabase/Storyblok clients, persistence)
```

---

## Layer Responsibilities

### DOMAIN

- Pure business rules: credential shape/format policies, payment signature string composition, product pricing lookup, amount reconciliation rules, methodology access policies.
- No React, no HTTP clients, no nodemailer, no Supabase imports.
- Typed entities/policies where defined; validation outcomes expressed as values, not side effects.

### APPLICATION

- Use-case orchestration: sign-in/up, session helpers, Robokassa payment creation and result verification, methodology purchases/access, newsletter subscribe, apply-form submit.
- Composes `DOMAIN` rules with calls to `INFRASTRUCTURE` and `services/` (pending payment, purchase writes).
- No UI; no duplicate validation logic beyond delegating to domain policies.

### INFRASTRUCTURE

- IO and adapters: nodemailer (Gmail), MD5 helpers for Robokassa, Storyblok client modules, Supabase browser/server client wrappers under `infrastructure/supabase` where present.
- `services/` holds Supabase-backed persistence (e.g. payments, users) — concrete DB and auth adapter usage.

### PRESENTATION

- Next.js App Router pages, layouts, API route handlers (transport), React components, client hooks.
- Invokes application use cases and server actions; reads shared route/constants; does not reimplement pricing, signatures, or core validation (domain + use cases own that).

---

## Core System Capabilities

| Area | Behavior |
|------|----------|
| **Authentication** | Email/password via Supabase Auth; domain validates credentials before `signInWithPassword`; `/auth/callback` exchanges OAuth code for session. |
| **Payments** | Robokassa redirect URL with signed query; pending row in DB; Result URL verifies signature and amount vs pending, then records purchase. |
| **Content / methodology** | Storyblok-driven pages; methodology module IDs and purchased-module resolution via application + infrastructure helpers. |
| **Access control** | Domain policies + application use cases gate payment UI and content using session and purchase data. |
| **Email / notifications** | Nodemailer in infrastructure: subscribe confirmation/notify; apply-form to teacher and applicant after domain validation. |

---

## Architecture Principles

- **Single source of truth:** Routes in `shared/constants/routes`; email/apply rules in `domain`; shared DTOs in `types/` where used.
- **No business logic in UI:** Components delegate to hooks and use cases.
- **No raw IO outside IO layers:** Email and payment crypto in `infrastructure/`; DB/auth side effects in `services/` / `lib/supabase` as adapters.
- **Strict dependency direction:** Inward-only; domain never depends on outer layers.

---

## Project Structure

```text
src/
├── app/                 # Routes, API handlers, server actions, layouts
├── application/         # useCases/ + use-cases/
├── components/
├── domain/
├── hooks/
├── infrastructure/
├── lib/
├── presentation/
├── services/
├── shared/constants/
├── types/
└── utils/
```

---

## Key System Flows

### Payment (methodology)

1. Authenticated client `POST /api/pay` with CSRF header and `productId`.
2. Route: env checks, production origin hardening, CSRF cookie vs header, resolve payer email from Supabase session.
3. `createMethodologyPayment`: domain resolves price; infra MD5 for signature; `services` persist pending payment; return Robokassa URL.
4. Client redirects to gateway.
5. Gateway calls `/api/pay/result` with `OutSum`, `InvId`, `SignatureValue`.
6. `verifyRobokassaPaymentResult`: domain verifies signature and amount vs pending; `services` upsert purchase / delete pending; plain-text response per Robokassa contract.

### Authentication (email/password)

1. Form posts to server action (e.g. login).
2. `signIn` use case: `DOMAIN` validates credentials; then Supabase `signInWithPassword` via server client.
3. Success: redirect (e.g. methodology); session via Supabase cookies.
4. OAuth path: `/auth/callback` exchanges `code` and redirects to `next` query param.

---

## Tech Stack

- **Runtime:** Node.js  
- **Framework:** Next.js 16, React 19, TypeScript 5  
- **UI:** Tailwind CSS, react-hook-form, GSAP / Lenis / Lottie (where used), tailwindcss-motion  
- **Auth & DB:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)  
- **CMS:** Storyblok (`@storyblok/react`)  
- **Payments:** Robokassa (custom redirect + callback handling in application/infrastructure)  
- **Email:** Nodemailer  
- **Ops (when on Vercel):** `@vercel/speed-insights`  
- **Tooling:** ESLint (eslint-config-next), Prettier, PostCSS, Autoprefixer  

---

## Key Design Decisions

- **Pure domain:** Rules testable without Next/Supabase mocks; signature *strings* and tolerances live in domain; byte hashing in infrastructure.
- **Application layer:** One orchestration unit per workflow; routes stay thin (CSRF, JSON, status codes).
- **Isolated infrastructure:** Swap mail transport or hash implementation without changing invariants.
- **Thin UI:** Presentation binds UX to use cases; no duplicated payment or validation semantics.

---

## System Quality Attributes

- **Scalability:** Stateless app processes; durable state in Supabase; external gateways scale independently.
- **Maintainability:** Layer boundaries and shared constants reduce cross-layer drift.
- **Testability:** Domain and signature math unit-testable; use cases mockable at adapter seams (tests not yet wired in repo).
- **Separation of concerns:** Transport vs orchestration vs invariants vs IO are distinct.

---

## Future Improvements

- CI: `lint`, `tsc` / `next build` on every change.
- Tests: domain unit tests; payment signature contract tests; API integration tests with mocked Supabase/Robokassa.
- Observability: structured logs on payment callbacks; error tracking; request/correlation IDs.
- Architecture lint: ESLint import boundaries (e.g. `domain` may not import `app`).

---

## Summary

The system implements a **layered modular monolith**: Supabase for identity and purchase persistence, Storyblok for content, Robokassa for payments, nodemailer for notifications. **Domain invariants are centralized; application coordinates; infrastructure and services own IO.** The layout supports incremental hardening (tests, CI, lint rules) without restructuring features.
