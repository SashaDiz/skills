#!/usr/bin/env node
/**
 * Post a 6-slide TikTok slideshow via the PosteAhora API.
 *
 * Usage: node post-to-tiktok.js --config <config.json> --dir <slides-dir> --caption "caption text" --title "post title"
 *
 * Uploads slide1 through slide6 to PosteAhora storage (presigned URL + PUT),
 * then creates a TikTok photo (slideshow) post as a DRAFT. The user adds a
 * trending sound in the TikTok app, then publishes.
 *
 * TikTok only accepts JPEG for photo posts (PNG fails with
 * file_format_check_failed), so PNG slides are converted before upload.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const configPath = getArg('config');
const dir = getArg('dir');
const caption = getArg('caption');
const title = getArg('title') || '';

if (!configPath || !dir || !caption) {
  console.error('Usage: node post-to-tiktok.js --config <config.json> --dir <dir> --caption "text" [--title "text"]');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const BASE_URL = process.env.POSTEAHORA_API_URL || 'https://api.posteahora.com/functions/v1/api';
const API_KEY = process.env.POSTEAHORA_API_KEY || config.posteahora?.apiKey;
const ACCOUNT_ID = config.posteahora?.accountIds?.tiktok;

if (!API_KEY) {
  console.error('Missing PosteAhora API key (config.posteahora.apiKey or POSTEAHORA_API_KEY).');
  process.exit(1);
}
if (!ACCOUNT_ID) {
  console.error('Missing TikTok account id (config.posteahora.accountIds.tiktok). Run `posteahora accounts`.');
  process.exit(1);
}

const authHeaders = { Authorization: `Bearer ${API_KEY}` };

// TikTok photo posts must be JPEG. Return a JPEG path for a slide, converting
// the PNG the overlay step produced if a .jpg isn't already there.
async function ensureJpeg(dir, num) {
  const jpgPath = path.join(dir, `slide${num}.jpg`);
  if (fs.existsSync(jpgPath)) return jpgPath;

  const pngPath = path.join(dir, `slide${num}.png`);
  if (!fs.existsSync(pngPath)) return null;

  let canvasLib;
  try {
    canvasLib = require('canvas');
  } catch {
    throw new Error(
      `${pngPath} is PNG and TikTok only accepts JPEG. Install node-canvas (npm install canvas) so it can be converted, or drop slide${num}.jpg in ${dir}.`,
    );
  }
  const img = await canvasLib.loadImage(pngPath);
  const canvas = canvasLib.createCanvas(img.width, img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);
  fs.writeFileSync(jpgPath, canvas.toBuffer('image/jpeg', { quality: 0.92 }));
  return jpgPath;
}

// Upload a local file: ask PosteAhora for a presigned URL, then PUT the bytes.
// Returns the public URL to attach to a post. The presigned URL expires after
// 300s, so the PUT follows immediately.
async function uploadImage(filePath) {
  const bytes = fs.readFileSync(filePath);
  const contentType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const presignRes = await fetch(`${BASE_URL}/media/upload-url`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: path.basename(filePath),
      contentType,
      sizeBytes: bytes.length,
    }),
  });
  const presigned = await presignRes.json();
  if (!presignRes.ok || !presigned.uploadUrl) {
    throw new Error(`upload-url failed: ${JSON.stringify(presigned)}`);
  }
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const putRes = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: ab,
  });
  if (!putRes.ok) throw new Error(`PUT upload failed: HTTP ${putRes.status}`);
  return presigned.publicUrl;
}

(async () => {
  console.log('📤 Uploading slides...');
  const mediaUrls = [];
  for (let i = 1; i <= 6; i++) {
    let filePath;
    try {
      filePath = await ensureJpeg(dir, i);
    } catch (e) {
      console.error(`  ❌ ${e.message}`);
      process.exit(1);
    }
    if (!filePath) {
      console.error(`  ❌ Missing: ${path.join(dir, `slide${i}.jpg`)} (or .png)`);
      process.exit(1);
    }
    console.log(`  Uploading slide ${i}...`);
    try {
      const url = await uploadImage(filePath);
      mediaUrls.push(url);
      console.log(`  ✅ ${url}`);
    } catch (e) {
      console.error(`  ❌ ${e.message}`);
      process.exit(1);
    }
    if (i < 6) await new Promise((r) => setTimeout(r, 800));
  }

  console.log('\n📱 Creating TikTok draft post...');
  const postRes = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caption,
      title,
      // One mapping only: a draft keeps a single row and would silently drop
      // any extra channels. Cross-post separately with status scheduled/published.
      accountMappings: [{ platform: 'tiktok', accountId: ACCOUNT_ID }],
      mediaUrls,
      // Explicit: this is what routes the post to TikTok's photo endpoint.
      mediaType: 'image',
      postType: 'post',
      // Draft: lands in the TikTok inbox. Add a trending sound, then publish.
      status: 'draft',
      // Omitting this block makes the post fall back to privacyLevel SELF_ONLY
      // (publishes privately — nobody sees it); sending it without privacyLevel
      // fails with `Privacy level "undefined"`. Keys must be camelCase —
      // snake_case is silently ignored. TikTok's photo title is `photoTitle`;
      // a `title` key here is ignored.
      platformOptions: {
        tiktok: {
          photoTitle: title.slice(0, 90),
          privacyLevel: config.posteahora?.tiktok?.privacyLevel || 'PUBLIC_TO_EVERYONE',
          disableComment: false,
          disableDuet: false,
          disableStitch: false,
          autoAddMusic: true,
        },
      },
    }),
  });

  const result = await postRes.json();
  if (!postRes.ok) {
    console.error('❌ Post failed:', JSON.stringify(result));
    process.exit(1);
  }
  console.log('✅ Draft created!', JSON.stringify(result));

  // Save metadata
  const postId = result.id || result.postId || (Array.isArray(result.postIds) ? result.postIds[0] : undefined);
  const meta = {
    postId,
    caption,
    title,
    status: 'draft',
    postedAt: new Date().toISOString(),
    images: mediaUrls.length,
  };
  const metaPath = path.join(dir, 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`📋 Metadata saved to ${metaPath}`);
})();
