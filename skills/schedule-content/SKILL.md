---
name: schedule-content
description: >
  Create, schedule and publish social posts across the user's connected networks
  (Instagram, X/Twitter, LinkedIn, Threads, Facebook, TikTok and more) using the
  PosteAhora MCP tools. Trigger on "schedule my posts", "post this to Instagram",
  "schedule these posts", "post this to X and LinkedIn", "plan my week of content",
  "publish now", or similar.
---

# Schedule & publish content → PosteAhora

Use this when the user wants real posts created, scheduled, or published across
their connected social accounts. This skill **can publish**, so confirm before
anything goes live (see Guardrails).

## Always do first
1. Call **`list_accounts`**. You need each account's `id` to target a channel —
   the API refuses to publish without an explicit `accountId`. Never guess or
   reuse an id across platforms.
2. If the user has no connected account for a requested platform, tell them and
   skip that channel — don't invent one.

## Inputs to gather (ask only what's missing)
- **What to post** — caption/body. Offer to draft it if the user is vague.
- **Which channels** — map each to an `accountId` from `list_accounts`.
- **When** — now, or a specific date/time. Assume the user's local timezone;
  scheduled times must be in the future (ISO 8601).
- **Media** (optional) — only attach media the user actually provides. To upload a
  file, use **`create_upload_url`** → have the user `PUT` the bytes → use the
  returned `publicUrl` in `mediaUrls`. Never fabricate media URLs.
- **Per-platform tweaks** (optional) — shorter text for X, TikTok draft mode, etc.

## Steps
1. Build the plan: for each post, the caption, the target channels
   (`accountMappings: [{ platform, accountId }]`), any `mediaUrls`, and the time.
2. **Show the full plan and get an explicit "yes"** before creating anything —
   captions, channels and times laid out clearly.
3. Create each post:
   - **Publish now:** `create_post` with `status: "published"`.
   - **Schedule:** `schedule_post` with `scheduledAt` (future ISO 8601).
   - **Draft only:** `create_post` with `status: "draft"`.
4. After creating, confirm with `list_posts` or `get_post_status` and report back:
   what was scheduled/published, to which channels, at what time.

## Guardrails
- **Publishing is irreversible and outward-facing** — always confirm the final
  plan with the user before calling `create_post`/`schedule_post` with a
  publish/schedule status. When unsure, create a `draft` and ask.
- Require an explicit `accountId` per channel (from `list_accounts`). Hard-stop if
  missing; do not fall back to "the first connected account".
- Never invent media URLs, stats, or claims in captions.
- Respect each platform's limits (e.g. X character count) — offer a per-platform
  caption instead of silently truncating.
- If one post fails, report which one and continue with the rest.
