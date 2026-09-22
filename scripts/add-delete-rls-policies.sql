-- Add DELETE policies for Reset Data functionality
-- Run this in Supabase SQL Editor

-- Tickets: allow anon DELETE
DROP POLICY IF EXISTS "tickets_anon_delete" ON tickets;
CREATE POLICY "tickets_anon_delete" ON tickets
  FOR DELETE TO anon
  USING (true);

-- Documents: allow anon DELETE
DROP POLICY IF EXISTS "documents_anon_delete" ON documents;
CREATE POLICY "documents_anon_delete" ON documents
  FOR DELETE TO anon
  USING (true);

-- Verify
SELECT tablename, policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tickets', 'documents')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;
