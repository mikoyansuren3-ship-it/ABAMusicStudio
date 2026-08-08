-- 015_invoice_email_tracking.sql
-- Track when an invoice was emailed to the family and to which address, so
-- the Money page can show "Sent Aug 7" and offer a resend instead of a blind
-- second send. Columns are covered by the existing invoices policies
-- (admin-managed; parents read their own rows).
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).

begin;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_to TEXT;

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- select column_name from information_schema.columns
--   where table_name = 'invoices' and column_name in ('sent_at','sent_to');
--                                                    -- expect: both rows
