# Supabase localhost + production checklist

## 1) Authentication URL settings

- In Supabase Dashboard -> Authentication -> URL Configuration:
  - `Site URL`: `https://irinaexamprep.com`
  - `Redirect URLs` must include:
    - `http://localhost:3000/auth/callback`
    - `http://localhost:3000/reset-password`
    - `https://irinaexamprep.com/auth/callback`
    - `https://irinaexamprep.com/reset-password`

## 2) Local environment (`.env.local`)

- Required keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose in browser code)
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local testing

## 3) Production environment variables

- In hosting provider (for production):
  - `NEXT_PUBLIC_SITE_URL=https://irinaexamprep.com`
  - Same Supabase keys for the production project
  - Robokassa secrets (`ROBOKASSA_PASS1`, `ROBOKASSA_PASS2`, etc.) only on server

## 4) Security checks

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is never used in client components.
- Ensure all writes to `purchases`/`pending_payments` happen in server routes/services.
- Ensure callback route `/api/pay/result` is reachable from payment provider.

## 5) Smoke test matrix

- Localhost:
  - signup -> email confirm -> callback works
  - forgot/reset password works
  - payment flow creates `pending_payments`, callback upgrades to `purchases`
- Production:
  - login/logout/session endpoint works
  - `/api/my-purchases` reflects post-payment access
  - payment success/fail redirect returns to methodology page

