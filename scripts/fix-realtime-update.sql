-- Fix for UPDATE events not syncing across browsers via Supabase Realtime
-- Run this in Supabase SQL Editor

-- =============================================
-- REPLICA IDENTITY: Required for UPDATE events
-- =============================================
-- Supabase Realtime's postgres_changes requires REPLICA IDENTITY FULL
-- for UPDATE events to be properly broadcast to subscribers.
-- Without it, UPDATE WAL entries may not include enough data.
ALTER TABLE tickets REPLICA IDENTITY FULL;
ALTER TABLE documents REPLICA IDENTITY FULL;

-- =============================================
-- VERIFY REPLICA IDENTITY
-- =============================================
SELECT relname, relreplident
FROM pg_class
WHERE relname IN ('tickets', 'documents');
-- relreplident: 'd' = DEFAULT, 'f' = FULL, 'n' = NOTHING, 'i' = USING INDEX
-- Should show 'f' for both tables
