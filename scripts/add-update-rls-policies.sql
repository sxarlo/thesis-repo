-- RLS policies for anon UPDATE on tickets and documents
-- Run this in Supabase SQL Editor

-- Tickets: allow anon to update status, counter, and timestamps
CREATE POLICY "tickets_anon_update" ON tickets
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Documents: allow anon to update status and timestamps
CREATE POLICY "documents_anon_update" ON documents
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('tickets', 'documents');
