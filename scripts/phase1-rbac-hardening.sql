-- ============================================================
-- Phase 1B: Least-privilege RLS + server-side Reset System
-- Thesis Smart Queue Management System
--
-- Run this in the Supabase SQL Editor (project cyozpbmdqtdjerqmvkkz).
--
-- ORDER MATTERS: apply this script BEFORE deploying the Phase 1A
-- frontend. The frontend now restores the admin identity after a
-- page refresh by reading its OWN admin_profiles row as the
-- authenticated user, which requires the
-- "admin_profiles_select_own" policy created below.
--
-- What this does:
--   1. admin_profiles — deterministic policies replacing whatever
--      is currently there:
--        anon          : SELECT only (username -> email lookup in
--                        the login form; Phase 3 should move this
--                        to an RPC and drop anon SELECT entirely)
--        authenticated : SELECT own row only (needed by 1A)
--        no INSERT/UPDATE/DELETE for anon or authenticated
--   2. tickets / documents — drops ALL existing policies, then:
--        anon          : SELECT + INSERT with status='pending'
--                        (kiosk flows only)
--        authenticated : SELECT + INSERT with status='pending'
--                        + UPDATE restricted to an ACTIVE admin
--                        (admin_profiles row for auth.uid())
--        nobody        : no DELETE policy at all
--   3. REVOKEs as defense-in-depth: RLS alone makes a forbidden
--      UPDATE/DELETE silently match 0 rows (no error); an explicit
--      REVOKE makes the attempt fail loudly with 42501 and blocks
--      it even if a future policy is added by mistake.
--   4. public.reset_queue_system() — SECURITY DEFINER RPC so the
--      registrar admin can still wipe the queue after DELETE is
--      revoked. Guard clauses run BEFORE any DELETE.
--
-- Roles touched: anon, authenticated, service_role (granted).
-- service_role bypasses RLS and keeps full access. Dashboard and
-- maintenance SQL run as postgres/owner and are unaffected.
-- ============================================================

begin;

-- ─── 0. Ensure RLS is enabled (idempotent) ──────────────────────────────────
alter table public.admin_profiles enable row level security;
alter table public.tickets        enable row level security;
alter table public.documents      enable row level security;

-- ─── 1. Drop EVERY existing policy on the three tables ──────────────────────
-- (dynamic so unknown/legacy policy names cannot survive)
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('admin_profiles', 'tickets', 'documents')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ─── 2. admin_profiles policies ─────────────────────────────────────────────

-- anon: login-form lookup (username -> email) before sign-in.
-- NOTE: this exposes admin usernames/emails to anonymous callers;
-- replace with an RPC and remove in Phase 3 (credentials phase).
create policy "admin_profiles_anon_select_login"
  on public.admin_profiles
  for select to anon
  using (true);

-- authenticated: a user may only read their OWN profile row.
-- Required by Phase 1A session restore on page refresh.
create policy "admin_profiles_select_own"
  on public.admin_profiles
  for select to authenticated
  using (auth.uid() = id);

-- The app never writes admin_profiles from the client (accounts are
-- managed via SQL/Dashboard), so revoke for both API roles.
revoke insert, update, delete on public.admin_profiles from anon, authenticated;

-- ─── 3. tickets policies ────────────────────────────────────────────────────

-- Kiosk: anyone may read the queue (monitors, status check, realtime)
-- and may only create brand-new PENDING tickets.
create policy "tickets_anon_select"
  on public.tickets for select to anon using (true);
create policy "tickets_anon_insert"
  on public.tickets for insert to anon with check (status = 'pending');

-- Admin session: same insert rights as the kiosk (transfer flow),
-- full read, and UPDATE restricted to an active admin profile.
create policy "tickets_auth_select"
  on public.tickets for select to authenticated using (true);
create policy "tickets_auth_insert"
  on public.tickets for insert to authenticated with check (status = 'pending');
create policy "tickets_auth_update"
  on public.tickets for update to authenticated
  using (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.is_active = true
    )
  );
-- No DELETE policy for any role.

-- ─── 4. documents policies ──────────────────────────────────────────────────

create policy "documents_anon_select"
  on public.documents for select to anon using (true);
create policy "documents_anon_insert"
  on public.documents for insert to anon with check (status = 'pending');

create policy "documents_auth_select"
  on public.documents for select to authenticated using (true);
create policy "documents_auth_insert"
  on public.documents for insert to authenticated with check (status = 'pending');
create policy "documents_auth_update"
  on public.documents for update to authenticated
  using (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.is_active = true
    )
  );
-- No DELETE policy for any role.

-- ─── 5. Table-level REVOKEs (defense-in-depth) ──────────────────────────────
-- anon: kiosk needs SELECT + INSERT only.
revoke update, delete on public.tickets   from anon;
revoke update, delete on public.documents from anon;
-- authenticated: admins need SELECT + INSERT + UPDATE, never DELETE.
revoke delete on public.tickets   from authenticated;
revoke delete on public.documents from authenticated;

-- ─── 6. Server-side Reset System (SECURITY DEFINER RPC) ─────────────────────
-- Runs with the function owner's privileges so the DELETEs inside are not
-- subject to the (intentionally absent) client DELETE policies.
-- Guard clauses run BEFORE any row is touched.
create or replace function public.reset_queue_system()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'reset_queue_system: not authenticated';
  end if;

  if not exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.is_active = true
      and ap.department = 'registrar'
  ) then
    raise exception 'reset_queue_system: not authorized (registrar only)';
  end if;

  delete from public.documents;
  delete from public.tickets;
end;
$$;

-- Functions grant EXECUTE to PUBLIC by default — remove it.
revoke execute on function public.reset_queue_system() from public;
revoke execute on function public.reset_queue_system() from anon;
grant  execute on function public.reset_queue_system() to authenticated;
grant  execute on function public.reset_queue_system() to service_role;

-- ─── 7. Keep kiosk realtime working (idempotent) ────────────────────────────
do $$
begin
  alter publication supabase_realtime add table tickets;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table documents;
exception when duplicate_object then null;
end $$;

commit;

-- ============================================================
-- VERIFICATION QUERIES (run in the SQL Editor, as postgres)
-- ============================================================

-- 7a. Expected policies (10 rows: 2 admin_profiles, 4 tickets, 4 documents)
select tablename, policyname, cmd, roles::text
from pg_policies
where schemaname = 'public'
  and tablename in ('admin_profiles', 'tickets', 'documents')
order by tablename, policyname;

-- 7b. Expected grants:
--   tickets/documents  -> anon: INSERT, SELECT
--                         authenticated: SELECT, INSERT, UPDATE
--   admin_profiles     -> anon: SELECT
--                         authenticated: SELECT
--   (no UPDATE/DELETE for anon; no DELETE for authenticated)
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('admin_profiles', 'tickets', 'documents')
  and grantee in ('anon', 'authenticated', 'service_role')
order by table_name, grantee, privilege_type;

-- 7c. Expected: anon = false, authenticated = true, service_role = true
select rolname,
       has_function_privilege(rolname, 'public.reset_queue_system()', 'EXECUTE') as can_execute
from pg_roles
where rolname in ('anon', 'authenticated', 'service_role')
order by rolname;

-- 7d. Optional live check of the RPC as an admin: after logging in as the
--     registrar in the app, Reset Data should succeed; from the kiosk/anon
--     it must fail (use scripts/verify-phase1-rbac.mjs for the anon probes).

-- 7e. Cleanup: scripts/verify-phase1-rbac.mjs inserts a probe ticket if the
--     anon INSERT policy is still too permissive. Remove it here:
-- delete from public.tickets where id = 'phase1-probe-invalid-status';
