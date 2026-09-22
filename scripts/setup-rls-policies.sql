-- Complete RLS policies for the queue management system
-- Run this in Supabase SQL Editor
-- This replaces all previous RLS policies with a complete set

-- =============================================
-- TICKETS TABLE
-- =============================================

-- Enable RLS on tickets (idempotent)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "tickets_anon_update" ON tickets;
DROP POLICY IF EXISTS "tickets_anon_insert" ON tickets;
DROP POLICY IF EXISTS "tickets_anon_select" ON tickets;
DROP POLICY IF EXISTS "tickets_anon_delete" ON tickets;
DROP POLICY IF EXISTS "tickets_authenticated_all" ON tickets;

-- Allow anon INSERT on tickets
CREATE POLICY "tickets_anon_insert" ON tickets
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon SELECT on tickets
CREATE POLICY "tickets_anon_select" ON tickets
  FOR SELECT TO anon
  USING (true);

-- Allow anon UPDATE on tickets
CREATE POLICY "tickets_anon_update" ON tickets
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anon DELETE on tickets (required for Reset Data)
CREATE POLICY "tickets_anon_delete" ON tickets
  FOR DELETE TO anon
  USING (true);

-- Allow authenticated full access on tickets
CREATE POLICY "tickets_authenticated_all" ON tickets
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- DOCUMENTS TABLE
-- =============================================

-- Enable RLS on documents (idempotent)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "documents_anon_update" ON documents;
DROP POLICY IF EXISTS "documents_anon_insert" ON documents;
DROP POLICY IF EXISTS "documents_anon_select" ON documents;
DROP POLICY IF EXISTS "documents_anon_delete" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_all" ON documents;

-- Allow anon INSERT on documents
CREATE POLICY "documents_anon_insert" ON documents
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon SELECT on documents
CREATE POLICY "documents_anon_select" ON documents
  FOR SELECT TO anon
  USING (true);

-- Allow anon UPDATE on documents
CREATE POLICY "documents_anon_update" ON documents
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anon DELETE on documents (required for Reset Data)
CREATE POLICY "documents_anon_delete" ON documents
  FOR DELETE TO anon
  USING (true);

-- Allow authenticated full access on documents
CREATE POLICY "documents_authenticated_all" ON documents
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- REALTIME: Ensure tables are in the publication
-- =============================================
-- Supabase Realtime requires tables to be in the supabase_realtime publication
-- These commands may fail if tables are already in the publication (safe to ignore):
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE documents;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- VERIFY POLICIES
-- =============================================
SELECT tablename, policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tickets', 'documents')
ORDER BY tablename, policyname;

-- Verify realtime publication
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('tickets', 'documents');
