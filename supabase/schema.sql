CREATE TABLE IF NOT EXISTS pending_payments (
  inv_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id UUID NULL,
  out_sum NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ NULL,
  last_callback_at TIMESTAMPTZ NULL,
  callback_count INTEGER NOT NULL DEFAULT 0,
  paid_out_sum NUMERIC NULL,
  last_error_code TEXT NULL,
  last_error_message TEXT NULL,
  result_last_payload JSONB NULL,
  result_last_signature TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS user_id UUID NULL;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS last_callback_at TIMESTAMPTZ NULL;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS callback_count INTEGER;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS paid_out_sum NUMERIC NULL;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS last_error_code TEXT NULL;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS last_error_message TEXT NULL;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS result_last_payload JSONB NULL;
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS result_last_signature TEXT NULL;

UPDATE pending_payments
SET status = 'pending'
WHERE status IS NULL;

UPDATE pending_payments
SET callback_count = 0
WHERE callback_count IS NULL;

ALTER TABLE pending_payments ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE pending_payments ALTER COLUMN status SET NOT NULL;
ALTER TABLE pending_payments ALTER COLUMN callback_count SET DEFAULT 0;
ALTER TABLE pending_payments ALTER COLUMN callback_count SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pending_payments_status_check'
  ) THEN
    ALTER TABLE pending_payments
      ADD CONSTRAINT pending_payments_status_check
      CHECK (status IN ('pending', 'completed', 'expired', 'reconciliation_failed'));
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  module_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, module_id)
);

CREATE TABLE IF NOT EXISTS payment_callbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inv_id TEXT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  http_method TEXT NULL,
  out_sum NUMERIC NULL,
  signature_value TEXT NULL,
  signature_valid BOOLEAN NOT NULL,
  source_ip INET NULL,
  headers JSONB NULL,
  payload JSONB NOT NULL,
  processing_outcome TEXT NOT NULL,
  error_message TEXT NULL
);

WITH ranked_pending AS (
  SELECT
    inv_id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(btrim(email)), product_id
      ORDER BY created_at DESC NULLS LAST, inv_id DESC
    ) AS rn
  FROM pending_payments
  WHERE status = 'pending'
)
UPDATE pending_payments AS pp
SET
  status = 'expired',
  last_error_code = COALESCE(pp.last_error_code, 'deduplicated_open_invoice'),
  last_error_message = COALESCE(
    pp.last_error_message,
    'Expired automatically during migration to preserve a single open invoice per buyer/product.'
  )
FROM ranked_pending
WHERE pp.inv_id = ranked_pending.inv_id
  AND ranked_pending.rn > 1;

CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_payments_open_invoice
  ON pending_payments ((lower(btrim(email))), product_id)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_inv_id ON payment_callbacks(inv_id, received_at DESC);

ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_callbacks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pending_payments'
      AND policyname = 'No direct access'
  ) THEN
    CREATE POLICY "No direct access" ON pending_payments FOR ALL USING (false) WITH CHECK (false);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'purchases'
      AND policyname = 'No direct access'
  ) THEN
    CREATE POLICY "No direct access" ON purchases FOR ALL USING (false) WITH CHECK (false);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_callbacks'
      AND policyname = 'No direct access'
  ) THEN
    CREATE POLICY "No direct access" ON payment_callbacks FOR ALL USING (false) WITH CHECK (false);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.finalize_robokassa_result_payment(
  p_inv_id TEXT,
  p_out_sum NUMERIC,
  p_signature_value TEXT,
  p_http_method TEXT,
  p_payload JSONB,
  p_headers JSONB DEFAULT NULL,
  p_source_ip INET DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_invoice public.pending_payments%ROWTYPE;
  v_normalized_email TEXT;
  v_purchase_exists BOOLEAN;
  v_processing_outcome TEXT;
  v_error_message TEXT;
BEGIN
  SELECT *
  INTO v_invoice
  FROM public.pending_payments
  WHERE inv_id = p_inv_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.payment_callbacks (
      inv_id,
      http_method,
      out_sum,
      signature_value,
      signature_valid,
      source_ip,
      headers,
      payload,
      processing_outcome,
      error_message
    ) VALUES (
      p_inv_id,
      p_http_method,
      p_out_sum,
      p_signature_value,
      TRUE,
      p_source_ip,
      p_headers,
      COALESCE(p_payload, '{}'::jsonb),
      'missing_invoice',
      'No invoice found for the provided InvId.'
    );

    RETURN jsonb_build_object(
      'acknowledgement', 'error',
      'processing_outcome', 'missing_invoice'
    );
  END IF;

  v_normalized_email := lower(btrim(v_invoice.email));

  IF v_invoice.status = 'completed'
     AND COALESCE(v_invoice.paid_out_sum, v_invoice.out_sum) = p_out_sum THEN
    UPDATE public.pending_payments
    SET
      email = v_normalized_email,
      last_callback_at = NOW(),
      callback_count = COALESCE(callback_count, 0) + 1,
      paid_out_sum = COALESCE(paid_out_sum, p_out_sum),
      result_last_payload = COALESCE(p_payload, '{}'::jsonb),
      result_last_signature = p_signature_value,
      last_error_code = NULL,
      last_error_message = NULL
    WHERE inv_id = p_inv_id;

    INSERT INTO public.payment_callbacks (
      inv_id,
      http_method,
      out_sum,
      signature_value,
      signature_valid,
      source_ip,
      headers,
      payload,
      processing_outcome,
      error_message
    ) VALUES (
      p_inv_id,
      p_http_method,
      p_out_sum,
      p_signature_value,
      TRUE,
      p_source_ip,
      p_headers,
      COALESCE(p_payload, '{}'::jsonb),
      'duplicate_ok',
      NULL
    );

    RETURN jsonb_build_object(
      'acknowledgement', 'ok',
      'processing_outcome', 'duplicate_ok'
    );
  END IF;

  IF v_invoice.out_sum <> p_out_sum THEN
    v_error_message := format(
      'OutSum mismatch. Expected %s, received %s.',
      v_invoice.out_sum,
      p_out_sum
    );

    UPDATE public.pending_payments
    SET
      status = CASE
        WHEN status = 'completed' THEN status
        ELSE 'reconciliation_failed'
      END,
      last_callback_at = NOW(),
      callback_count = COALESCE(callback_count, 0) + 1,
      last_error_code = 'amount_mismatch',
      last_error_message = v_error_message,
      result_last_payload = COALESCE(p_payload, '{}'::jsonb),
      result_last_signature = p_signature_value
    WHERE inv_id = p_inv_id;

    INSERT INTO public.payment_callbacks (
      inv_id,
      http_method,
      out_sum,
      signature_value,
      signature_valid,
      source_ip,
      headers,
      payload,
      processing_outcome,
      error_message
    ) VALUES (
      p_inv_id,
      p_http_method,
      p_out_sum,
      p_signature_value,
      TRUE,
      p_source_ip,
      p_headers,
      COALESCE(p_payload, '{}'::jsonb),
      'amount_mismatch',
      v_error_message
    );

    RETURN jsonb_build_object(
      'acknowledgement', 'error',
      'processing_outcome', 'amount_mismatch'
    );
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.purchases
    WHERE lower(btrim(email)) = v_normalized_email
      AND module_id = v_invoice.product_id
  )
  INTO v_purchase_exists;

  IF NOT v_purchase_exists THEN
    INSERT INTO public.purchases (email, module_id)
    VALUES (v_normalized_email, v_invoice.product_id)
    ON CONFLICT (email, module_id) DO NOTHING;
    v_processing_outcome := 'completed';
  ELSE
    v_processing_outcome := 'purchase_already_exists';
  END IF;

  UPDATE public.pending_payments
  SET
    email = v_normalized_email,
    status = 'completed',
    completed_at = COALESCE(completed_at, NOW()),
    last_callback_at = NOW(),
    callback_count = COALESCE(callback_count, 0) + 1,
    paid_out_sum = p_out_sum,
    last_error_code = NULL,
    last_error_message = NULL,
    result_last_payload = COALESCE(p_payload, '{}'::jsonb),
    result_last_signature = p_signature_value
  WHERE inv_id = p_inv_id;

  INSERT INTO public.payment_callbacks (
    inv_id,
    http_method,
    out_sum,
    signature_value,
    signature_valid,
    source_ip,
    headers,
    payload,
    processing_outcome,
    error_message
  ) VALUES (
    p_inv_id,
    p_http_method,
    p_out_sum,
    p_signature_value,
    TRUE,
    p_source_ip,
    p_headers,
    COALESCE(p_payload, '{}'::jsonb),
    v_processing_outcome,
    NULL
  );

  RETURN jsonb_build_object(
    'acknowledgement', 'ok',
    'processing_outcome', v_processing_outcome
  );
END;
$$;
