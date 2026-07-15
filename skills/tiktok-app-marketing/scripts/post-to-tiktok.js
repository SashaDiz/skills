#!/usr/bin/env node
/**
 * Post a 6-slide TikTok slideshow via the PosteAhora API.
 *
 * Usage: node post-to-tiktok.js --config <config.json> --dir <slides-dir> --caption "caption text" --title "post title"
 *
 * Uploads slide1.png through slide6.png to PosteAhora storage (presigned URL +
 * PUT), then creates a TikTok photo (slideshow) post as a DRAFT. The user adds a
 * trending sound in the TikTok app, then publishes.
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

// Upload a local file: ask PosteAhora for a presigned URL, then PUT the bytes.
// Returns the public URL to attach to a post.
async function uploadImage(filePath) {
  const bytes = fs.readFileSync(filePath);
  const presignRes = await fetch(`${BASE_URL}/media/upload-url`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: path.basename(filePath),
      contentType: 'image/png',
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
    headers: { 'Content-Type': 'image/png' },
    body: ab,
  });
  if (!putRes.ok) throw new Error(`PUT upload failed: HTTP ${putRes.status}`);
  return presigned.publicUrl;
}

(async () => {
  console.log('📤 Uploading slides...');
  const mediaUrls = [];
  for (let i = 1; i <= 6; i++) {
    const filePath = path.join(dir, `slide${i}.png`);
    if (!fs.existsSync(filePath)) {
      console.error(`  ❌ Missing: ${filePath}`);
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
      accountMappings: [{ platform: 'tiktok', accountId: ACCOUNT_ID }],
      mediaUrls,
      mediaType: 'image',
      postType: 'post',
      // Draft: lands in the TikTok inbox. Add a trending sound, then publish.
      status: 'draft',
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
