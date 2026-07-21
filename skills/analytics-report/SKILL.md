---
name: analytics-report
description: >
  Pull social analytics from PosteAhora and summarize how the user's posts are
  performing across platforms, then optionally seed new ideas from what worked.
  Trigger on "show my analytics", "how did my posts do", "how are my posts doing",
  "analytics report", "which posts performed best", "what should I post more of",
  or similar.
---

# Analytics report → PosteAhora

Use this when the user wants to understand performance. This skill is **read-only**
for metrics — it never publishes.

## Steps
1. Call **`get_analytics`**. Choose the window from the user's ask:
   `period` = `7d` | `30d` (default) | `90d` | `all`. Pass a `platform` filter only
   if the user asked about one network.
2. Summarize the returned data:
   - **Headline totals** — views, likes, comments, shares (from `summary.totals`).
   - **Per-platform breakdown** — which network is pulling weight
     (`summary.byPlatform`).
   - **Top posts** — rank `posts` by engagement (likes + comments + shares, or
     `totalInteractions`) and show the best few with their captions.
3. Offer a takeaway: what format/topic/platform is working, and what to double down
   on. Keep it concrete and tied to the numbers.
4. **Optionally**, if the user wants to act on it, offer to add follow-up ideas to
   their board with `create_idea` (that's the `collect-post-ideas` flow) — ask
   before creating anything. Any caption you draft there follows the same
   formatting contract as a real post: blocks separated by one empty line, real
   line breaks, no Markdown, hashtags inside the caption text.

## Guardrails
- Read-only: never call `create_post`, `schedule_post`, or `publish_post_now` here.
- Never invent numbers. Report only what `get_analytics` returns.
- If a metric is `null`, say the platform doesn't report it — don't show it as `0`.
- Metrics refresh hourly, so very recent posts may show little or no data yet — say
  so rather than implying they underperformed.
