# Production Testing Checklist

## 1. Vercel

Wait until the deployment for commit `ce94c73` is `Ready`.

Open `Project Settings -> Environment Variables` and verify these production values:

```env
NEXT_PUBLIC_SITE_URL=https://irinaexamprep.com

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

ROBOKASSA_LOGIN=...
ROBOKASSA_PASS1=...
ROBOKASSA_PASS2=...
ROBOKASSA_TESTPASS1=...
ROBOKASSA_TESTPASS2=...
ROBOKASSA_TEST=1

STORYBLOK_ACCESS_TOKEN=...
```

Use `STORYBLOK_ACCESS_TOKEN` in production. The code still supports legacy
`NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN`, but the server-side variable is safer.

If any production variable changes, trigger a redeploy.

## 2. Supabase Authentication

Open `Authentication -> URL Configuration`.

### Site URL

```text
https://irinaexamprep.com
```

### Redirect URLs

Keep production URLs:

```text
https://irinaexamprep.com/auth/callback
https://irinaexamprep.com/reset-password
```

Keep local development URLs if you still use local testing:

```text
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
http://127.0.0.1:3000/auth/callback
http://127.0.0.1:3000/reset-password
```

Add `www` variants only if the site is reachable through `www`.

## 3. Robokassa

In Robokassa technical settings verify:

### Result URL

```text
https://irinaexamprep.com/api/pay/result
```

### Success URL

```text
https://irinaexamprep.com/methodology
```

### Fail URL

```text
https://irinaexamprep.com/methodology
```

Keep test mode enabled during verification:

```env
ROBOKASSA_TEST=1
```

## 4. Supabase Production Auth Test

### Registration

1. Open `https://irinaexamprep.com/signup` in an incognito window.
2. Register a fresh email.
3. Open the confirmation email.
4. Verify the link points to `https://irinaexamprep.com/...` and not `localhost`.
5. Confirm the account and complete sign-in.

### Login

1. Open `https://irinaexamprep.com/login`.
2. Sign in with the new account.
3. Refresh the page.
4. Verify the session is still active.

### Reset password

1. Open `https://irinaexamprep.com/forgot-password`.
2. Request a reset email.
3. Verify the reset link points to `https://irinaexamprep.com/reset-password`.

If any email flow points to `localhost`, the issue is still in Supabase URL configuration.

## 5. Robokassa Production-Site Test

### Successful sandbox payment

1. Sign in on `https://irinaexamprep.com`.
2. Open `https://irinaexamprep.com/methodology`.
3. Start a purchase.
4. Complete the payment in Robokassa test mode.
5. Return to the site.
6. Wait for payment confirmation on the methodology page.
7. Verify access to the paid video appears.

### Cancel flow

1. Start a purchase.
2. Cancel or fail it in Robokassa.
3. Return to the site.
4. Verify access is not granted.

### Repeat purchase prevention

1. After a successful test purchase, try to buy the same product again.
2. Verify the system does not create a second usable purchase flow.

## 6. Supabase SQL Verification

Run these checks after a successful test payment.

### Invoice ledger

```sql
SELECT
  inv_id,
  email,
  product_id,
  out_sum,
  paid_out_sum,
  status,
  completed_at,
  callback_count,
  last_error_code,
  last_error_message
FROM pending_payments
ORDER BY created_at DESC
LIMIT 10;
```

Expected:

- `status = 'completed'`
- `paid_out_sum` is filled
- `callback_count >= 1`

### Granted access

```sql
SELECT *
FROM purchases
ORDER BY created_at DESC
LIMIT 10;
```

Expected:

- a row exists for the buyer email and the paid module

### Callback log

```sql
SELECT
  inv_id,
  processing_outcome,
  signature_valid,
  out_sum,
  error_message,
  received_at
FROM payment_callbacks
ORDER BY received_at DESC
LIMIT 20;
```

Expected:

- `processing_outcome = 'completed'` or `purchase_already_exists`
- `signature_valid = true`

## 7. Switch To Live Credentials

Move to live Robokassa credentials only after all of the following have passed:

- production registration
- production login
- production password reset
- successful Robokassa sandbox payment
- verified `pending_payments` completion
- verified `purchases` access row
- verified `payment_callbacks` success log

Then update production environment variables:

```env
ROBOKASSA_LOGIN=<live>
ROBOKASSA_PASS1=<live>
ROBOKASSA_PASS2=<live>
ROBOKASSA_TEST=0
```

Redeploy, run one minimal real payment, and repeat the SQL verification.
