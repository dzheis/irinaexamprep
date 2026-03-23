-- Run in Supabase: SQL Editor → New query → paste and Run.

-- Pending payments (Robokassa InvId); moved to purchases on successful result callback.
CREATE TABLE IF NOT EXISTS pending_payments (
  inv_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  email TEXT NOT NULL,
  out_sum NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases: email + module_id. Video access is checked by session email.
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  module_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, module_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);

ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access" ON pending_payments FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No direct access" ON purchases FOR ALL USING (false) WITH CHECK (false);
