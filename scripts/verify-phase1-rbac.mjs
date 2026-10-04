/**
 * Phase 1B verification probes (ANON ONLY — no credentials used).
 *
 * Usage:
 *   node scripts/verify-phase1-rbac.mjs
 *
 * Interprets each HTTP probe against the POST-hardening expectations defined
 * by scripts/phase1-rbac-hardening.sql:
 *   - kiosk reads/inserts must keep working (allowed)
 *   - all anon writes (UPDATE/DELETE/invalid INSERT/RPC) must be blocked
 *
 * Run BEFORE applying the SQL to document the vulnerable baseline (probes
 * will report FAIL), then run AGAIN after applying the SQL (all PASS).
 *
 * Notes:
 *   - A 2xx on an UPDATE/DELETE probe for a non-existent row id is reported
 *     as FAIL because it means the REVOKE was not applied (RLS alone would
 *     silently match 0 rows). The authoritative grant check is query 7b in
 *     phase1-rbac-hardening.sql.
 *   - Authenticated-role probes are intentionally NOT run (no credentials).
 *   - Probe 8 sends a deliberately invalid insert (status='serving'); if it
 *     ever succeeds, the reported row id must be deleted from the Dashboard.
 */

import { readFileSync } from 'node:fs'

function loadEnv() {
  const env = {}
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const i = line.indexOf('=')
    if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return env
}

const env = loadEnv()
const SUPABASE_URL = env.VITE_SUPABASE_URL
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
  process.exit(2)
}

const base = `${SUPABASE_URL}/rest/v1`
const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
}

async function probe(name, expectation, method, path, { body, prefer } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const text = await res.text()
  const allowed = res.ok
  const actual = allowed ? 'ALLOWED' : 'BLOCKED'
  const passed = actual === expectation
  const detail = allowed
    ? (text.length > 120 ? `${text.slice(0, 120)}...` : text || '(empty 2xx)')
    : text.slice(0, 200)
  return { name, expectation, actual, passed, status: res.status, detail }
}

const fakeId = 'phase1-probe-nonexistent-id'
const invalidInsert = {
  id: 'phase1-probe-invalid-status',
  number: 'Z999',
  student_name: 'PHASE1 PROBE (safe to delete)',
  student_id: '00000000',
  service: 'inquiry',
  document_type: null,
  counter: null,
  status: 'serving',
  created_at: new Date().toISOString(),
  called_at: null,
  completed_at: null,
  department: 'registrar',
  customer_type: 'student',
  source: 'kiosk',
  transferred_from: null,
}

const probes = [
  ['Kiosk reads still work: SELECT tickets', 'ALLOWED', 'GET', '/tickets?select=id&limit=1'],
  ['Kiosk reads still work: SELECT documents', 'ALLOWED', 'GET', '/documents?select=id&limit=1'],
  ['Login lookup still works: SELECT admin_profiles', 'ALLOWED', 'GET', '/admin_profiles?select=id&limit=1'],
  ['anon UPDATE tickets rejected', 'BLOCKED', 'PATCH', `/tickets?id=eq.${fakeId}`, { body: { status: 'pending' }, prefer: 'return=representation' }],
  ['anon DELETE tickets rejected', 'BLOCKED', 'DELETE', `/tickets?id=eq.${fakeId}`, { prefer: 'return=representation' }],
  ['anon UPDATE documents rejected', 'BLOCKED', 'PATCH', `/documents?id=eq.${fakeId}`, { body: { status: 'pending' }, prefer: 'return=representation' }],
  ['anon DELETE documents rejected', 'BLOCKED', 'DELETE', `/documents?id=eq.${fakeId}`, { prefer: 'return=representation' }],
  ['anon INSERT ticket with non-pending status rejected (RLS)', 'BLOCKED', 'POST', '/tickets', { body: invalidInsert }],
  ['anon RPC reset_queue_system rejected', 'BLOCKED', 'POST', '/rpc/reset_queue_system', { body: {} }],
  ['anon INSERT admin_profiles rejected', 'BLOCKED', 'POST', '/admin_profiles', { body: { id: fakeId, email: 'x@x', username: 'phase1-probe', display_name: 'probe', role: 'x', department: 'registrar', is_active: true } }],
  ['anon UPDATE admin_profiles rejected', 'BLOCKED', 'PATCH', `/admin_profiles?id=eq.${fakeId}`, { body: { display_name: 'probe' }, prefer: 'return=representation' }],
  ['anon DELETE admin_profiles rejected', 'BLOCKED', 'DELETE', `/admin_profiles?id=eq.${fakeId}`, { prefer: 'return=representation' }],
]

const results = []
for (const [name, expectation, method, path, opts] of probes) {
  try {
    results.push(await probe(name, expectation, method, path, opts || {}))
  } catch (err) {
    results.push({ name, expectation, actual: 'ERROR', passed: false, status: 0, detail: String(err) })
  }
}

console.log('\nPhase 1B anon probes (target = state AFTER phase1-rbac-hardening.sql)\n')
for (const r of results) {
  const mark = r.passed ? 'PASS' : 'FAIL'
  console.log(`[${mark}] ${r.name}`)
  console.log(`        expected=${r.expectation} actual=${r.actual} http=${r.status}`)
  if (!r.passed || process.env.VERBOSE) console.log(`        ${r.detail.replace(/\n/g, ' ')}`)
}

const failed = results.filter(r => !r.passed)
console.log(`\n${results.length - failed.length}/${results.length} probes meet the hardened expectation.`)
if (failed.length > 0) {
  console.log('FAILURES = current state is NOT yet hardened (expected before running the SQL,')
  console.log('or a regression afterwards). Apply scripts/phase1-rbac-hardening.sql, then re-run.')
  console.log('Authoritative grant check: query 7b inside that SQL file.')
}
if (results.some(r => r.actual === 'ALLOWED' && r.name.includes('non-pending'))) {
  console.log('\nWARNING: probe insert row phase1-probe-invalid-status may exist — delete it in the Dashboard (Table editor > tickets).')
}
process.exit(failed.length > 0 ? 1 : 0)
