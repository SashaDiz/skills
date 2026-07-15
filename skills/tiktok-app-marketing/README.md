# TikTok App Marketing

**Automate TikTok slideshow marketing for any app or product — for AI agents.**

An end-to-end TikTok growth workflow: research competitors, generate AI images,
add text overlays, post as drafts, track analytics, and iterate on the hooks and
CTAs that actually drive installs and revenue. Built to run hands-off through an
AI agent, with posting and analytics powered by
[PosteAhora](https://posteahora.com).

The whole loop: **generate → overlay → post → track → iterate.**

---

## Table of contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [What's in this skill](#whats-in-this-skill)
- [Powered by PosteAhora](#powered-by-posteahora)

---

## What it does

- **Competitor research** — study what's getting views in your niche (hooks,
  formats, posting cadence, trending sounds) before you post a thing.
- **AI slideshow generation** — photorealistic images (OpenAI gpt-image-1.5,
  Stability, Replicate, or your own) with consistent style across all 6 slides.
- **Text overlays** — burn hooks and CTAs onto slides with node-canvas.
- **Draft posting** — create TikTok drafts via PosteAhora, so you can add a
  trending sound before publishing (music is the single biggest reach factor).
- **Cross-posting** — the same content to Instagram Reels, YouTube Shorts,
  Threads, and more, in one step.
- **Analytics feedback loop** — a daily report pulls per-post metrics and, when
  connected, RevenueCat conversions, then tells you exactly what to double down on
  and what to drop.

## How it works

1. **Onboarding** — a natural conversation about your app, audience, and goals.
2. **Research** — competitor and niche analysis feeds the content strategy.
3. **Generate** — AI creates a consistent 6-slide slideshow.
4. **Overlay** — hooks and CTAs are added to the slides.
5. **Post** — slides go up as a TikTok draft via PosteAhora; add a sound, publish.
6. **Track** — a daily analytics report scores each post (views × conversions).
7. **Iterate** — the diagnostic framework decides: scale it, fix the CTA, fix the
   hook, or reset — so every day's content is informed by data.

## Prerequisites

The skill bundles no dependencies — your agent installs what your setup needs:

- **Node.js 18+** — all scripts run on Node.
- **node-canvas** (`npm install canvas`) — for text overlays.
- **A [PosteAhora](https://posteahora.com) account** — the posting + analytics
  backbone. Connect TikTok (and optionally Instagram, YouTube, Threads, …) in
  **Connections**, then create an API key under **Settings → API & integrations**.
- **An image generator** — OpenAI `gpt-image-1.5` recommended (also Stability,
  Replicate, or bring your own images).
- **RevenueCat** *(optional)* — closes the loop from views to paying users, so the
  daily report can optimize for revenue, not just vanity metrics.

## Quick start

```bash
# 1. Scaffold the campaign workspace
node scripts/onboarding.js --init --dir tiktok-marketing/

# 2. Fill in tiktok-marketing/config.json — your app profile, image-gen key,
#    and PosteAhora API key + TikTok account id (from `posteahora accounts`).

# 3. Validate the config
node scripts/onboarding.js --validate --config tiktok-marketing/config.json

# 4. Generate slides, overlay text, and post a draft
node scripts/generate-slides.js  --config tiktok-marketing/config.json --dir tiktok-marketing/posts/day1
node scripts/post-to-tiktok.js   --config tiktok-marketing/config.json --dir tiktok-marketing/posts/day1 --caption "your hook"

# 5. Track performance (schedule this daily)
node scripts/daily-report.js     --config tiktok-marketing/config.json --days 3
```

Open `SKILL.md` for the full agent playbook — the AI agent walks you through all
of this conversationally.

## What's in this skill

```
SKILL.md            The agent playbook — onboarding, strategy, posting, iteration
skill-card.md       Skill metadata, use cases, and risk notes
references/         Deep-dive guides
  ├─ slide-structure.md        6-slide structure & hook writing
  ├─ competitor-research.md    How to research a niche
  ├─ app-categories.md         Category-specific templates
  ├─ analytics-loop.md         The views × conversions feedback loop
  └─ revenuecat-integration.md Conversion tracking
scripts/            Runnable Node.js tools
  ├─ onboarding.js             Scaffold & validate the campaign config
  ├─ generate-slides.js        AI image generation
  ├─ add-text-overlay.js       Hook/CTA overlays (node-canvas)
  ├─ competitor-research.js    Browser-based niche research
  ├─ post-to-tiktok.js         Upload slides + create a TikTok draft (PosteAhora)
  ├─ check-analytics.js        Pull per-post TikTok analytics (PosteAhora)
  └─ daily-report.js           Daily performance report + recommendations
```

## Powered by PosteAhora

Posting and analytics run on [PosteAhora](https://posteahora.com), a social media
scheduling and publishing platform for humans and AI agents. It's what lets this
skill create drafts and read per-post metrics across TikTok and every other
connected network — no TikTok video-ID juggling required.

- Website — https://posteahora.com
- Docs & API — https://posteahora.com/docs
- CLI — https://www.npmjs.com/package/@posteahora/cli
- MCP server — https://github.com/posteahora/mcp

## License

MIT — ready for commercial and non-commercial use.
