-- DEBUG: Check data isolation issue
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if invoices have user_id set
SELECT 
  id, 
  invoice_number, 
  user_id,
  client_name,
  total_amount,
  created_at
FROM invoices
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check current authenticated user
SELECT auth.uid() as current_user_id;

-- 3. Check all users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- 4. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('invoices', 'transactions', 'profiles');

-- 5. Check active policies
SELECT 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual 
    ELSE 'No USING clause' 
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check 
    ELSE 'No WITH CHECK clause' 
  END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'invoices'
ORDER BY policyname;

-- 6. Test query as if you were a specific user (replace USER_ID_HERE)
-- This simulates what the app sees
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims.sub TO 'USER_ID_HERE';
SELECT COUNT(*) as invoice_count FROM invoices;
RESET role;
