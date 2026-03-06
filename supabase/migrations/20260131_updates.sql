-- Run this in your Supabase SQL Editor to update the schema

-- 1. Add logo_url to profiles for Business Identity
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url text;

-- 2. Add client_name to invoices for 'Simple Mode' (no prepoluated counterparty)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_name text;

-- 3. Ensure 'type' allows 'in' and 'out' (already in initial schema but good to verify)
-- alter table invoices drop constraint if exists invoices_type_check;
-- alter table invoices add constraint invoices_type_check check (type in ('in', 'out'));
