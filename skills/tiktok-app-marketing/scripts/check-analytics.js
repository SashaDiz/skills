#!/usr/bin/env node
/**
 * TikTok analytics via the PosteAhora API.
 *
 * PosteAhora stores each post's remote TikTok id internally and returns per-post
 * metrics directly from GET /analytics — there is NO video-id reconciliation,
 * "missing" list, or release-id matching to do. This simply pulls the analytics
 * for TikTok and writes a snapshot the daily report can diff against.
 *
 * Usage: node check-analytics.js --config <config.json> [--days 3]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const configPath = getArg('config');
const days = parseInt(getArg('days') || '3');

if (!configPath) {
  console.error('Usage: node check-analytics.js --config <config.json> [--days 3]');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const BASE_URL = process.env.POSTEAHORA_API_URL || 'https://api.posteahora.com/functions/v1/api';
const API_KEY = process.env.POSTEAHORA_API_KEY || config.posteahora?.apiKey;

if (!API_KEY) {
  console.error('Missing PosteAhora API key (config.posteahora.apiKey or POSTEAHORA_API_KEY).');
  process.exit(1);
}

// Map a look-back window (days) to a PosteAhora analytics period.
function periodForDays(d) {
  if (d <= 7) return '7d';
  if (d <= 30) return '30d';
  if (d <= 90) return '90d';
  return 'all';
}

async function api(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return res.json();
}

(async () => {
  console.log(`📊 Pulling TikTok analytics (last ${days} days)\n`);

  const data = await api(`/analytics?period=${periodForDays(days)}&platform=tiktok`);
  const startMs = Date.now() - days * 86400000;

  const rows = (data.posts || [])
    .filter((p) => !p.publishedAt || new Date(p.publishedAt).getTime() >= startMs)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const results = rows.map((p) => ({
    postId: p.postId,
    date: (p.publishedAt || '').slice(0, 10),
    hook: (p.caption || '').substring(0, 60),
    views: p.views || 0,
    likes: p.likes || 0,
    comments: p.comments || 0,
    shares: p.shares || 0,
  }));

  console.log('📈 Per-Post Analytics:\n');
  for (const r of results) {
    const v = r.views > 1000 ? `${(r.views / 1000).toFixed(1)}K` : r.views;
    console.log(`  ${r.date} | ${v} views | ${r.likes} likes | ${r.comments} comments | ${r.shares} shares`);
    console.log(`    "${r.hook}..."\n`);
  }

  const snapPath = path.join(path.dirname(configPath), 'analytics-snapshot.json');
  fs.writeFileSync(snapPath, JSON.stringify({ date: new Date().toISOString(), posts: results }, null, 2));
  console.log(`💾 Saved analytics snapshot to ${snapPath}`);

  const totalViews = results.reduce((s, r) => s + r.views, 0);
  const totalLikes = results.reduce((s, r) => s + r.likes, 0);
  console.log('\n📊 Summary:');
  console.log(`  Posts tracked: ${results.length}`);
  console.log(`  Total views: ${totalViews.toLocaleString()}`);
  console.log(`  Total likes: ${totalLikes.toLocaleString()}`);
  if (results.length > 0) {
    const best = results.reduce((a, b) => (a.views > b.views ? a : b));
    console.log(`  Best: ${best.views.toLocaleString()} views — "${best.hook}..."`);
  }
  if (results.length === 0) {
    console.log('  (No TikTok analytics yet — metrics refresh hourly, so very recent posts may not show data.)');
  }
})();
