#!/usr/bin/env node
/**
 * Delete parks by id (admin). Useful after deploying DELETE /api/parks/:id.
 *
 *   ADMIN_API_KEY=... node scripts/delete-parks.mjs https://skatedir.com 1032 1034
 *   ADMIN_API_KEY=... node scripts/delete-parks.mjs http://localhost:3001 1032
 */
const base = (process.argv[2] || 'http://localhost:3001').replace(/\/$/, '');
const ids = process.argv.slice(3).map(Number).filter(Number.isFinite);
const key = process.env.ADMIN_API_KEY || '';

if (!ids.length) {
  console.error('Usage: ADMIN_API_KEY=... node scripts/delete-parks.mjs <apiBase> <id> [id...]');
  process.exit(1);
}

for (const id of ids) {
  const res = await fetch(`${base}/api/parks/${id}`, {
    method: 'DELETE',
    headers: key ? { 'x-admin-key': key } : {},
  });
  const body = await res.text();
  console.log(id, res.status, body.slice(0, 200));
}
