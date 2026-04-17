# Отчёт: финальная стабилизация Clean Architecture (единый IO, границы слоёв)

Дата фиксации: 2026-04-17. Проект: `irinaexamprep`. Цель: зафиксировать строгие границы слоёв без смены бизнес-логики и без новых «фичевых» рефакторингов.

---

## 1. Созданные файлы

### Infrastructure — новые модули

| Файл | Назначение |
|------|------------|
| `src/infrastructure/storyblok/offerStoryblok.ts` | Загрузка оферты из Storyblok (перенесено из `lib/offer-storyblok.ts`) |
| `src/infrastructure/storyblok/textPageStoryblok.ts` | Текстовые страницы из Storyblok (перенесено из `lib/text-page-storyblok.ts`) |
| `src/infrastructure/storyblok/freeResourcesStoryblok.ts` | Free resources из Storyblok (перенесено из `lib/free-resources-storyblok.ts`) |
| `src/infrastructure/methodology/fallbackModuleCatalog.ts` | Локальный fallback каталога модулей методики (перенесено из `lib/methodology-modules.ts`) |
| `src/infrastructure/auth/supabaseSession.ts` | Серверные операции сессии: sign out, exchange code, email текущего пользователя |
| `src/infrastructure/auth/supabasePasswordAuth.ts` | Вход по email/password через Supabase (адаптер для application) |
| `src/infrastructure/purchases/purchaseAccessQuery.ts` | Проверка покупки по email + module_id (service role) |
| `src/infrastructure/security/csrfToken.ts` | Генерация CSRF-токена (`crypto.randomBytes`) |
| `src/infrastructure/http/remoteFileFetch.ts` | Прокси загрузки файла по URL (внешний `fetch`) |

### Application — новые use cases

| Файл | Назначение |
|------|------------|
| `src/application/useCases/payment/startMethodologyCheckout.ts` | Оркестрация оплаты: env, email плательщика, вызов `createMethodologyPayment` |
| `src/application/useCases/methodology/getVideoEmbedUrl.ts` | Доступ к embed URL видео методики (auth + admin/purchase + Storyblok) |
| `src/application/useCases/auth/signOut.ts` | Выход из сессии через инфраструктуру |
| `src/application/useCases/auth/completeAuthCallback.ts` | Обмен кода OAuth на сессию (callback) |

---

## 2. Удалённые файлы и каталоги

### Полностью удалённые файлы (IO-фасады и дубликаты)

**`src/lib/` — удалены как слой IO или как реэкспорты в инфраструктуру**

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/storyblok.ts`
- `src/lib/methodology-storyblok.ts`
- `src/lib/offer-storyblok.ts`
- `src/lib/text-page-storyblok.ts`
- `src/lib/free-resources-storyblok.ts`
- `src/lib/methodology-modules.ts`
- `src/lib/auth-form-constants.ts`

**`src/services/` — весь слой удалён (были только реэкспорты в infrastructure)**

- `src/services/lessonService.ts`
- `src/services/userService.ts`
- `src/services/paymentService.ts`
- `src/services/supabaseClient.ts`
- `src/services/supabaseServer.ts`
- `src/services/auth.ts`

**`src/utils/`**

- `src/utils/auth-form-constants.ts`
- `src/utils/.gitkeep` (каталог `src/utils/` удалён после очистки)

**`src/application/use-cases/`** (дубликат пути к use cases, не использовался)

- `src/application/use-cases/auth/getSessionUser.ts`
- `src/application/use-cases/methodology/getPurchasedModuleIdsForCurrentUser.ts`
- каталоги `use-cases/auth`, `use-cases/methodology`, `use-cases/` удалены

**`src/infrastructure/` — устранение дублирующих точек входа**

- `src/infrastructure/supabase/serverClient.ts`
- `src/infrastructure/supabase/browserClient.ts`
- `src/infrastructure/storyblok/storyblokApi.ts` (содержимое слито в `storyblok/client.ts`)
- `src/infrastructure/methodology/storyblokModuleIds.ts` (реэкспорт; импорты переведены на `methodologyStoryblok.ts`)

**`src/domain/` — удалены только реэкспорты-обёртки**

- `src/domain/entities/User.ts`
- `src/domain/entities/Result.ts`
- `src/domain/entities/Question.ts`
- `src/domain/entities/Exam.ts`
- `src/domain/policies/methodologyPurchasePolicy.ts`
- каталоги `domain/entities/`, `domain/policies/` удалены после очистки

**`src/presentation/`**

- `src/presentation/routes.ts`
- вся директория `src/presentation/` (включая `.gitkeep` в `components/`, `hooks/`, `pages/`)

### Удалённые пустые / плейсхолдерные каталоги

- `src/services/`
- `src/utils/`
- `src/presentation/`
- `src/shared/types/` (только `.gitkeep`)
- `src/shared/utils/` (только `.gitkeep`)
- `src/infrastructure/api/` (только `.gitkeep`)
- `src/infrastructure/storage/` (только `.gitkeep`)
- `src/app/api/debug/` и вложенные `config`, `courses`, `offer`
- `src/app/api/robokassa-callback/`

---

## 3. Изменённые файлы (сводка по зонам)

### Корень проекта

- `middleware.ts` — импорт `updateSession` с `@/lib/supabase/middleware` на `@/infrastructure/supabase/middleware`

### App Router — страницы и клиенты

- `src/app/offer/page.tsx` — импорт Storyblok: `@/infrastructure/storyblok/offerStoryblok`; роуты: `@/shared/constants/routes`
- `src/app/payment-refund/page.tsx` — `@/infrastructure/storyblok/textPageStoryblok`; `@/shared/constants/routes`
- `src/app/privacy/page.tsx` — то же для text page и routes
- `src/app/free-resources/page.tsx` — `@/infrastructure/storyblok/freeResourcesStoryblok`
- `src/app/free-resources/free-resources-client.tsx` — тип `FreeResourceForDisplay` из infrastructure
- `src/app/methodology/page.tsx` — `getMethodologyFromStoryblok` из `@/infrastructure/methodology/methodologyStoryblok`

**Компоненты и страницы с `ROUTES` / `HOME_HASH`:** все импорты `@/presentation/routes` заменены на `@/shared/constants/routes` (в т.ч.):

- `src/components/layout/Header.tsx`, `Footer.tsx`, `AuthHeaderBlock.tsx`
- `src/components/ui/ApplyModalContext.tsx`, `CookieConsent.tsx`, `PageTransition.tsx`
- `src/components/sections/CoursesMethodologySection.tsx`, `CTASection.tsx`, `HeroSection.tsx`
- `src/app/login/page.tsx`, `signup/page.tsx`, `reset-password/page.tsx`, `forgot-password/page.tsx`

### API routes (тонкие адаптеры)

- `src/app/api/pay/route.ts` — транспорт (CSRF, same-origin, JSON); бизнес/IO через `startMethodologyCheckout`
- `src/app/api/video-embed/route.ts` — только маппинг статуса → HTTP; логика в `getMethodologyVideoEmbedUrl`
- `src/app/api/auth/logout/route.ts` — вызов `signOutCurrentUser`
- `src/app/auth/callback/route.ts` — вызов `completeAuthCodeExchange` + редирект
- `src/app/api/csrf-token/route.ts` — генерация токена через `infrastructure/security/csrfToken`
- `src/app/api/download/route.ts` — загрузка через `infrastructure/http/remoteFileFetch`

### Application

- `src/application/useCases/auth/signIn.ts` — без прямого Supabase; через `supabasePasswordAuth`
- `src/application/useCases/methodology/getPurchasedModules.ts` — `getAllMethodologyModuleIds` из `methodologyStoryblok.ts`
- `src/application/useCases/methodology/methodologyAccess.ts` — политики из `@/domain/methodology/methodologyPurchasePolicy`

### Infrastructure

- `src/infrastructure/supabase/server.ts` — канонические имена `createServerClient`, `createServiceClient` (вместо общего `createClient` на сервере)
- `src/infrastructure/supabase/browser.ts` — экспорт `createBrowserClient`
- `src/infrastructure/storyblok/client.ts` — единая точка Storyblok init + `fetchStory` + `getConfig` (слияние с бывшим `storyblokApi.ts`)
- `src/infrastructure/methodology/methodologyStoryblok.ts` — импорты fallback из `fallbackModuleCatalog.ts`
- `src/infrastructure/auth/supabaseUser.ts`, `src/infrastructure/payment/persistence.ts`, `src/infrastructure/purchases/purchasedModules.ts` — импорты Supabase с `server` вместо удалённого `serverClient`

### Hooks и types

- `src/hooks/useAuth.ts` — `createBrowserClient` из `@/infrastructure/supabase/browser`
- `src/types/domain.ts` — `User` и `Result` напрямую из `domain/auth/User` и `domain/methodology/Result`

---

## 4. Что осталось в `src/lib/` (осознанно)

Только не-IO утилиты и типы:

- `src/lib/storyblok-types.ts` — TypeScript-типы контента Storyblok (без сетевых вызовов)
- `src/lib/cookie-consent.ts` — клиентские хелперы localStorage для баннера cookie

Их импорты из `infrastructure` (типы) и `components` допустимы как «чистые» зависимости без серверного IO.

---

## 5. Валидация после изменений

- `npm run lint` — успешно (`eslint src --max-warnings 0`)
- `npm run build` — успешно (Next.js production build)

---

## 6. Итоговая модель зависимостей (зафиксировано в коде)

| Слой | Разрешённые импорты (по факту репозитория) |
|------|-------------------------------------------|
| **Domain** | только `@/domain/*` |
| **Application** | `@/domain/*`, `@/infrastructure/*`, `@/types/*`, `@/shared/*`, другие `@/application/*` |
| **Infrastructure** | `@/infrastructure/*`, `@/lib/storyblok-types` (типы), внешние пакеты |
| **Presentation (app, components, hooks)** | application, types, shared, infrastructure только там, где нужен клиентский адаптер (например Supabase browser), без обхода application для серверных сценариев |

**Единый IO-периметр:** все вызовы Supabase, Nodemailer, Storyblok API, крипто-хеши Robokassa, внешний HTTP для прокси, service-role запросы к БД — внутри `src/infrastructure/`.

---
