-- VERIFY AND FIX RLS POLICIES FOR DATA ISOLATION
-- Run this in Supabase SQL Editor to ensure each user only sees their own data

-- 1. Check current policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('invoices', 'profiles', 'transactions', 'counterparties', 'invoice_items', 'payment_links')
ORDER BY tablename;

-- 2. Drop and recreate all policies to ensure proper isolation

-- INVOICES
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" 
ON invoices FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" 
ON invoices FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" 
ON invoices FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" 
ON invoices FOR DELETE 
USING (auth.uid() = user_id);

-- TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
ON transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
ON transactions FOR DELETE 
USING (auth.uid() = user_id);

-- COUNTERPARTIES
DROP POLICY IF EXISTS "Users can view own counterparties" ON counterparties;
CREATE POLICY "Users can view own counterparties" 
ON counterparties FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own counterparties" 
ON counterparties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own counterparties" 
ON counterparties FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own counterparties" 
ON counterparties FOR DELETE 
USING (auth.uid() = user_id);

-- INVOICE ITEMS (through invoice relationship)
DROP POLICY IF EXISTS "Users can view own invoice items" ON invoice_items;
CREATE POLICY "Users can view own invoice items" 
ON invoice_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own invoice items" 
ON invoice_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own invoice items" 
ON invoice_items FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own invoice items" 
ON invoice_items FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

-- PAYMENT LINKS (through invoice relationship)
DROP POLICY IF EXISTS "Users view own payment links" ON payment_links;
CREATE POLICY "Users can view own payment links" 
ON payment_links FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = payment_links.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own payment links" 
ON payment_links FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = payment_links.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own payment links" 
ON payment_links FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = payment_links.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own payment links" 
ON payment_links FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = payment_links.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

-- Verify all tables have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE counterparties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Final verification query
SELECT 
  tablename, 
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;
