---
name: tiktok-app-marketing
description: >
  Run a TikTok slideshow marketing pipeline for an app or product — generate
  slides, add text overlays, post via PosteAhora, pull per-post analytics back,
  and adjust hooks and CTAs from what the data says. Trigger on "set up TikTok
  marketing", "create slideshow posts", "TikTok growth for my app", "make TikToks
  for my product", "why aren't my TikToks converting", or similar.
---

# TikTok App Marketing

Automate your entire TikTok slideshow marketing pipeline: generate → overlay → post → track → iterate.

**Why it works:** most app marketing fails because it posts blindly — no way to tell a viral-but-worthless post from a quiet-but-converting one. This skill closes the loop: it posts through PosteAhora, pulls per-post analytics back from PosteAhora, and (optionally) cross-references conversions from RevenueCat, so every day's content is informed by what actually drove views and paying users.

## Prerequisites

This skill does NOT bundle any dependencies. Your AI agent will need to research and install the following based on your setup. Tell your agent what you're working with and it will figure out the rest.

### Required
- **Node.js** (v18+) — all scripts run on Node. Your agent should verify this is installed and install it if not.
- **node-canvas** (`npm install canvas`) — used for adding text overlays to slide images. This is a native module that may need build tools (Python, make, C++ compiler) on some systems. Your agent should research the install requirements for your OS.
- **PosteAhora** — this is the backbone of the whole system. PosteAhora handles posting to TikTok (and the other platforms it supports), but more importantly, it provides the **analytics API** that powers the daily feedback loop. Without PosteAhora, the agent can post but can't track what's working — and the feedback loop is what makes this skill actually grow your account instead of just posting blindly. Sign up at [posteahora.com](https://posteahora.com).

### Image Generation (pick one)
You choose what generates your images. Your agent should research the API docs for whichever you pick:
- **OpenAI** — `gpt-image-1.5` **(ALWAYS 1.5, never 1)**. Needs an OpenAI API key. Best for realistic photo-style images. This is the recommended default.
- **Stability AI** — Stable Diffusion XL and newer. Needs a Stability AI API key. Good for stylized/artistic images.
- **Replicate** — run any open-source model (Flux, SDXL, etc.). Needs a Replicate API token. Most flexible.
- **Local** — bring your own images. No API needed. Place images in the output directory and the script skips generation.

### Conversion Tracking (optional but recommended for mobile apps)
- **RevenueCat** — this is what completes the intelligence loop. PosteAhora tells you which posts get views. RevenueCat tells you which posts drive **paying users**. Combined, the agent can distinguish between a viral post that makes no money and a modest post that actually converts — and optimize accordingly. Install the RevenueCat skill from ClaWHub (`clawhub install revenuecat`) for full API access to subscribers, MRR, trials, churn, and revenue. There's also a **RevenueCat MCP** for programmatic control over products and offerings from your agent/IDE.

### Cross-Posting (optional, recommended)
PosteAhora supports cross-posting to Instagram Reels, YouTube Shorts, Threads, Facebook, LinkedIn, Bluesky, and Discord. Your agent should research which platforms fit your audience and connect them in PosteAhora. Same content, different algorithms, more reach.

## First run

The first time this skill loads, walk the user through setup conversationally —
account warmup, their app, competitor research, PosteAhora and RevenueCat wiring,
content strategy, the daily cron. The full flow is in
[references/onboarding.md](references/onboarding.md). Do it once, not per post.

**Don't skip the TikTok account warmup.** A brand-new account that jumps straight
to posting AI slideshows gets read as a bot and throttled from day one.

## Core Workflow

### 1. Generate Slideshow Images

Use `scripts/generate-slides.js`:

```bash
node scripts/generate-slides.js --config tiktok-marketing/config.json --output tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --prompts prompts.json
```

The script auto-routes to the correct provider based on `config.imageGen.provider`. Supports OpenAI, Stability AI, Replicate, or local images.

**⚠️ Timeout warning:** Generating 6 images takes 3-9 minutes total (30-90 seconds each for gpt-image-1.5). Set your exec timeout to at least **600 seconds (10 minutes)**. If you get `spawnSync ETIMEDOUT`, the exec timeout is too short. The script supports resume — if it fails partway, re-run it and completed slides will be skipped.

**Critical image rules (all providers):**
- ALWAYS portrait aspect ratio (1024x1536 or 9:16 equivalent) — fills TikTok screen
- Include "iPhone photo" and "realistic lighting" in prompts (for AI providers)
- ALL 6 slides share the EXACT same base description (only style/feature changes)
- Lock key elements across all slides (architecture, face shape, camera angle)
- See [references/slide-structure.md](references/slide-structure.md) for the 6-slide formula

### 2. Add Text Overlays

`scripts/add-text-overlay.js` renders text onto the slides with node-canvas. The
sizing and positioning are dialled in from hundreds of posts — install notes, the
`texts.json` format and the full styling spec are in
[references/text-overlays.md](references/text-overlays.md).

The rules that matter most:

- **4-6 words per line MAX**, 3-4 lines per slide.
- **Break lines yourself with `\n`** in `texts.json`. The script auto-wraps as a
  safety net, but manual breaks control the rhythm and look far better.
- **No emoji** — canvas can't render them, they come out blank. (This is about
  text baked into the image; emoji in the caption is fine.)
- **Reactions, not labels** — "Wait... this is nice??" beats "Modern minimalist".

### 3. Post to TikTok

```bash
node scripts/post-to-tiktok.js --config tiktok-marketing/config.json --dir tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --caption "caption" --title "title"
```

Under the hood, against the PosteAhora API:

1. **Get an upload URL for each slide.** `POST /media/upload-url` with
   `{ filename, contentType, sizeBytes }` returns `201 { uploadUrl, publicUrl }`.
   Then `PUT` the raw image bytes to `uploadUrl` with the matching `Content-Type`
   header. (There is no multipart `/upload` endpoint — it's always this presigned
   two-step, and the presigned URL expires after 300 seconds, so upload right
   away.) TikTok verifies URL ownership, so its media **must** be hosted this way.
   Slides must be **JPEG** — PNG fails with `file_format_check_failed`.

2. **Create the TikTok post as a draft**, with exactly one account mapping:

   ```json
   {
     "caption": "long storytelling caption ...",
     "accountMappings": [{ "platform": "tiktok", "accountId": "<tiktok account id>" }],
     "mediaUrls": ["https://.../slide1.jpg", "https://.../slide2.jpg", "..."],
     "mediaType": "image",
     "postType": "post",
     "status": "draft",
     "platformOptions": {
       "tiktok": {
         "photoTitle": "≤90 characters",
         "privacyLevel": "PUBLIC_TO_EVERYONE",
         "disableComment": false,
         "disableDuet": false,
         "disableStitch": false,
         "autoAddMusic": true
       }
     }
   }
   ```

   **Send `platformOptions.tiktok`.** Omit it and the post falls back to safe
   defaults — `privacyLevel: "SELF_ONLY"` — so it publishes **privately** and
   nobody sees it. Send the object without `privacyLevel` and it fails with
   `Privacy level "undefined"`. Keys are camelCase; snake_case (`privacy_level`)
   is silently ignored. The photo title key is **`photoTitle`** — a `title` here
   is ignored, and the post's top-level `title` fills the *video* title, not the
   photo one. `mediaType` is what routes the post to the photo endpoint instead
   of the video one, so always pass it explicitly.

3. **Cross-post in a SEPARATE call.** A draft stays a single post row and carries
   only the first account mapping — extra entries in a draft's `accountMappings`
   never publish anywhere. Make one more call for the other platforms with
   `status: "scheduled"` (or `"published"`), where PosteAhora fans the channels
   out into one post row per platform:

   ```json
   {
     "caption": "…",
     "accountMappings": [
       { "platform": "instagram", "accountId": "…" },
       { "platform": "youtube", "accountId": "…" }
     ],
     "mediaUrls": ["…"],
     "mediaType": "image",
     "status": "scheduled",
     "scheduledAt": "2026-07-21T16:30:00Z"
   }
   ```

The equivalent with the CLI — note it cannot send `platformOptions`, so it can't
create a working TikTok post; use it for the cross-posts only:

```bash
posteahora upload tiktok-marketing/posts/YYYY-MM-DD-HHmm/slide1.jpg   # → publicUrl
posteahora post "$CAPTION" --to instagram:<accountId> --media https://.../slide1.jpg --media https://.../slide2.jpg
```

### Why We Post TikTok as a Draft — Best Practice

The TikTok post lands in your TikTok inbox as a draft (`status: "draft"`), NOT published directly. This is intentional and critical:

1. **Music is everything on TikTok.** Trending sounds massively boost reach. The algorithm favours popular audio. An API can't pick the right trending sound — you need to browse TikTok's sound library and pick what's hot RIGHT NOW in your niche.
2. **You add the music manually**, then publish from your TikTok inbox. Takes 30 seconds per post.
3. **Posts without music get buried.** Silent slideshows look like ads and get skipped. A trending sound makes your content feel native.
4. **Creative control.** You can preview the final slideshow with music before it goes live. If something looks off, fix it before publishing.

**Tell the user during onboarding:** "Posts will land in your TikTok inbox as drafts. Before publishing each one, add a trending sound from TikTok's library — this is the single biggest factor in reach. It takes 30 seconds and makes a massive difference."

The cross-posts don't need the manual sound step, which is exactly why they go
out as their own scheduled/published call.

### 4. Pull Post Analytics

PosteAhora stores each post's remote platform ID internally — including TikTok — and returns analytics per post directly. There is **no** manual video-ID matching, no "missing" list, and no release-ID reconciliation to worry about. You publish, and once metrics are available, they show up under `GET /analytics`.

Use `scripts/check-analytics.js`:

```bash
node scripts/check-analytics.js --config tiktok-marketing/config.json --days 3
```

The script:
1. Calls `GET /analytics?period=7d&platform=tiktok` (period ∈ `7d|30d|90d|all`) to pull per-post metrics
2. Reads `summary.totals` and `summary.byPlatform` for the aggregate picture
3. Reads the `posts[]` array — each entry has `postId`, `caption`, `platform`, `views`, `likes`, `comments`, `shares`, `reach`, `saves`, `impressions`, and `fetchedAt`
4. Joins each analytics row back to its hook/CTA via `postId` (matched against `GET /posts`) so the feedback loop can attribute performance

The equivalent list/analytics calls with the CLI:

```bash
posteahora posts --status published
posteahora analytics --period 7d
```

**Note on freshness:** PosteAhora refreshes platform metrics roughly hourly, so a post published in the last hour or two may still show little or no data. That's expected — the daily morning cron looks at a 3-day window, so every post it reports on is well past that lag. Don't read too much into a brand-new post's zeros.

See [references/analytics-loop.md](references/analytics-loop.md) for full PosteAhora analytics API docs.

## Caption rules

Long storytelling captions pull far more views than short ones. Structure:
**Hook → Problem → Discovery → What it does → Result → hashtags**, conversational
tone. Put a short CTA near the top as well as at the end — TikTok truncates the
caption in-feed, so anything below the fold goes unread by most viewers.

The caption publishes byte for byte, so its spacing is entirely your
responsibility. Full contract in
[references/caption-format.md](references/caption-format.md); the essentials:

- One empty line between blocks, a single line break inside a list, never 3+ in a row.
- Real line breaks in the JSON string — an escaped backslash-n publishes a
  visible `\n` to readers.
- **No Markdown** — every platform except Discord renders it literally.
- **Hashtags inside the caption**, as the last block, ~5 max for TikTok. The
  separate `hashtags` field is stored on the post but never published.
- **No URL in a TikTok caption** — TikTok penalizes links there. Say "link in
  bio". The same holds for the Instagram cross-post; Facebook, LinkedIn, Threads
  and X can carry a real URL.
- Threads caps captions at 500 characters — trim the cross-post caption for it
  rather than letting it overflow.

## The Feedback Loop

This is what separates "posting TikToks" from running a marketing machine. Every
morning `scripts/daily-report.js` pulls the last 3 days from PosteAhora (plus
RevenueCat conversions when connected), cross-references views against paying
users, and recommends what to make today.

The diagnostic framework (views × conversions → what to change), hook evolution
tracking, decision thresholds and CTA rotation are all in
[references/feedback-loop.md](references/feedback-loop.md) — read it before
interpreting a report.

The short version: high views + low conversions → fix the CTA, keep the hook.
Low views + high conversions → fix the hook, keep everything downstream. Both low
→ full reset. High downloads + low paying subscribers → it's the app, not the
marketing.

## Cross-Posting

PosteAhora connects TikTok, Instagram, YouTube, X (Twitter), Facebook, LinkedIn, Threads, Bluesky, and Discord. Cross-post the same slides in a **separate scheduled/published call** from the TikTok draft (Core Workflow step 3) — one call listing every platform in `accountMappings`, which PosteAhora fans out into one post row per platform. Recommend:
- **Instagram Reels** — especially strong for beauty/lifestyle/home
- **YouTube Shorts** — long-tail discovery
- **Threads** — lightweight engagement driver (keep the caption under 500 chars)

Same slides, different algorithms, more surface area. Each platform's algo evaluates content independently.

## App Category Templates

See [references/app-categories.md](references/app-categories.md) for category-specific slide prompts and hook formulas.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| 1536x1024 (landscape) | Use 1024x1536 (portrait) |
| Font at 5% | Use 6.5% of width |
| Text at bottom | Position at 30% from top |
| Different rooms per slide | Lock architecture in EVERY prompt |
| Labels not reactions | "Wait this is nice??" not "Modern style" |
| Only tracking views | Track conversions — views without revenue = vanity |
| Same hooks forever | Iterate based on data, test new formats weekly |
| Cross-posting via a draft's `accountMappings` | A draft carries only the first mapping — cross-post in a separate scheduled/published call |
| TikTok post without `platformOptions.tiktok` | Falls back to `SELF_ONLY` — publishes privately, nobody sees it. Always send privacyLevel + photoTitle, camelCase |
| `title` inside `platformOptions.tiktok` | Ignored — TikTok's photo title key is `photoTitle` |
| PNG slides for TikTok | Convert to JPEG — PNG fails with `file_format_check_failed` |
| Hashtags in the `hashtags` field | They never publish — put them in the caption text |
| Caption as one dense block | One empty line between blocks — see references/caption-format.md |
| Publishing TikTok directly | Post as a draft — add a trending sound, then publish |
| Reading a brand-new post's zeros | PosteAhora metrics refresh ~hourly; wait for the daily 3-day window |
| `spawnSync ETIMEDOUT` | Exec timeout too short — image gen takes 3-9 min for 6 slides. Use a 10-minute timeout or generate slides one at a time |
