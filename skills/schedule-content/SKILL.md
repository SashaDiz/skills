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
1. Call **`list_accounts`**. This returns the accounts in the connector's/key's
   workspace (a connector or key is bound to one workspace). You need each
   account's `id` to target a channel — the API refuses to publish without an
   explicit `accountId`. Never guess or reuse an id across platforms. Ids also
   change when an account is reconnected, so fetch them fresh every run rather
   than reusing ids from earlier in the conversation.
2. If the user has no connected account for a requested platform, tell them and
   skip that channel — don't invent one.
3. Publishing needs a **member+ role** in that workspace. If a create/schedule/
   publish call returns `403`, the connector/key is view-only — tell the user
   they need write access (or a key from a workspace where they can post).

## Inputs to gather (ask only what's missing)
- **What to post** — caption/body. Offer to draft it if the user is vague.
- **Which channels** — map each to an `accountId` from `list_accounts`.
- **When** — now, or a specific date/time. Assume the user's local timezone;
  scheduled times must be in the future (ISO 8601).
- **Media** (optional) — the user's file, or one you generate for them. Either
  way it goes through **`create_upload_url`** → `PUT` the bytes → use the
  returned `publicUrl` in `mediaUrls`. Never fabricate media URLs. Aspect ratios,
  per-platform limits and the generation workflow are in
  [references/media.md](references/media.md).
- **Theme** (optional) — if the account has a voice/pillars file, read it first so
  the post sounds like the rest of the feed:
  [references/content-themes.md](references/content-themes.md).
- **Per-platform tweaks** (optional) — shorter text for X, TikTok draft mode, etc.

## Caption formatting (non-negotiable)

The caption is published byte for byte — PosteAhora never re-wraps or trims it.
A wall of text is a formatting mistake, not a platform quirk. Full rules and the
per-platform table live in [references/caption-format.md](references/caption-format.md);
the short version:

- Separate blocks (hook, body, CTA, link, hashtags) with **exactly one empty
  line**. Single line break inside a list. Never 3+ breaks in a row.
- Emit **real line breaks** in the tool argument. A backslash-n written as an
  escape sequence publishes a visible `\n`.
- **No Markdown** — `**bold**`, `- bullets`, `#headings` and `[links](url)` all
  render literally. Use emoji or numbers for bullets. (Discord is the exception.)
- **Hashtags go inside the caption**, as the last block. The separate `hashtags`
  field is stored but never published — hashtags passed there vanish.
- **No URL in Instagram or TikTok captions** — use "link in bio". URLs are fine
  on Facebook, LinkedIn, Threads, X, Bluesky and Discord.
- Put a short CTA near the top too: TikTok and Instagram truncate in-feed, so a
  CTA buried under the bullets is invisible to most viewers.

One idea, three platforms: keep the substance, change the cut. Long-form with
line-broken paragraphs on LinkedIn, one tight block under 280 on X, hook-first
with the CTA in the opening line on TikTok. That's what "adapted per platform"
means here — not the same paragraph pasted five times.

## Per-platform captions

When one caption can't serve every channel — Threads caps at 500 characters, X at
280, Bluesky at 300 graphemes — pass `platformCaptions` instead of truncating:

```json
{
  "caption": "shared caption",
  "platformCaptions": { "threads": "…under 500…", "twitter": "…under 280…" }
}
```

Overrides apply when the post is scheduled or published (each channel becomes its
own post row). A **draft** stays one row and keeps only the shared `caption`, so
where a draft is involved keep that shared caption within the tightest limit of
the targeted platforms.

## Steps
1. Build the plan: for each post, the caption, the target channels
   (`accountMappings: [{ platform, accountId }]`), any `mediaUrls`, and the time.
2. **Show the full plan and get an explicit "yes"** before creating anything.
   Render each caption **exactly as it will publish** — real line breaks, real
   blank lines — so the user approves the actual spacing, not a one-line preview.
   List channels and times alongside it.
3. Create each post:
   - **Publish now:** `create_post` with `status: "published"`.
   - **Schedule:** `schedule_post` with `scheduledAt` (future ISO 8601).
   - **Draft only:** `create_post` with `status: "draft"`.
4. After creating, confirm with `list_posts` or `get_post_status` and report back:
   what was scheduled/published, to which channels, at what time.

## Platform gotchas

- **Fan-out.** One `create_post`/`schedule_post` call with several
  `accountMappings` becomes **one post row per platform** when scheduled or
  published — seeing N rows for N channels is correct, not a duplicate. Drafts
  are the exception: a draft stays a single row and fans out only when published.
- **TikTok needs `platformOptions`.** Omit them entirely and the dispatcher falls
  back to safe defaults — `privacyLevel: "SELF_ONLY"` — so the post publishes
  **privately** and nobody sees it. Send the object but leave out `privacyLevel`
  and it fails with `Privacy level "undefined"`. Keys are camelCase; snake_case
  is silently ignored:
  ```json
  { "tiktok": { "privacyLevel": "PUBLIC_TO_EVERYONE", "photoTitle": "≤90 chars",
                "disableComment": false, "disableDuet": false,
                "disableStitch": false, "autoAddMusic": true } }
  ```
  The TikTok photo title is **`photoTitle`** — a `title` key inside
  `platformOptions.tiktok` is ignored, and the post's top-level `title` fills the
  *video* title, not the photo one. Set `autoAddMusic: false` when the video
  already carries its own audio.
- **TikTok media.** Pass `mediaType` explicitly (`"image"` or `"video"`) — it
  decides the photo vs video endpoint. Photos must be **JPEG**; PNG fails with
  `file_format_check_failed`. TikTok also verifies URL ownership, so the media
  must be hosted by PosteAhora: `create_upload_url` → `PUT` the bytes → use the
  returned `publicUrl`. The presigned URL expires in 300 seconds, so upload
  immediately after requesting it.
- **TikTok publishes asynchronously.** Right after its scheduled time the status
  stays `queued` for a few minutes. That is normal — don't report it as a failure
  or retry it; check again with `get_post_status`.
- **Verify what landed.** After scheduling, confirm each post's status. A post
  still sitting in `scheduled` with empty `platform_results` well past its
  `scheduledAt` did not go out — surface it to the user rather than assuming it
  will catch up.

## Guardrails
- **Publishing is irreversible and outward-facing** — always confirm the final
  plan with the user before calling `create_post`/`schedule_post` with a
  publish/schedule status. When unsure, create a `draft` and ask.
- Require an explicit `accountId` per channel (from `list_accounts`). Hard-stop if
  missing; do not fall back to "the first connected account".
- Never invent media URLs, stats, or claims in captions.
- Respect each platform's limits — offer a per-platform caption via
  `platformCaptions` instead of silently truncating.
- Don't pass hashtags in the `hashtags` field expecting them to publish; they go
  in the caption text.
- If one post fails, report which one and continue with the rest.
