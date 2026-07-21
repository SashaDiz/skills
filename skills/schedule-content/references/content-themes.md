# Content themes — voice, pillars and rotation

An account reads as one account when the posts share a voice and keep returning
to the same few subjects. Left to improvise, an agent writes each post from
scratch and the feed ends up sounding like five different people.

A **theme** is the reusable definition of what this account sounds like and what
it posts about. Establish it once, reuse it on every post.

## The theme file

Keep it wherever the user's project lives — `content-themes.json` next to their
work, or a note they can edit. Capture:

```json
{
  "brand": {
    "voice": "direct, practical, a bit dry — no hype words, no exclamation marks",
    "audience": "solo founders shipping their first product",
    "language": "English (US)",
    "avoid": ["game-changer", "revolutionary", "unlock", "in today's world"],
    "cta": ["What would you build first?", "Reply with your stack"]
  },
  "pillars": [
    { "id": "build-in-public", "angle": "what shipped this week, numbers included", "weight": 3 },
    { "id": "teardown",        "angle": "one thing a real product gets right",      "weight": 2 },
    { "id": "lesson",          "angle": "a mistake and what it cost",               "weight": 2 },
    { "id": "behind-scenes",   "angle": "the unglamorous part of the work",         "weight": 1 }
  ],
  "visual": {
    "palette": ["#111111", "#F63367", "#FAFAFA"],
    "fonts": "Inter for body, Playfair Display for headlines",
    "imagePrompt": "iPhone photo, natural light, muted tones, no text in the image",
    "template": "1080x1350, headline top-left, logo bottom-right"
  },
  "rotation": { "lastPillar": "teardown", "index": 4 }
}
```

Pillars are the recurring subjects; the weight is roughly how often each should
come up. The `visual` block is what keeps generated images looking like a set
rather than a pile — reuse the same prompt skeleton and palette every time (see
[media.md](media.md)).

## Using a theme

1. **Read the theme file before writing.** If none exists and the user wants
   consistency, offer to build one — ask for voice, audience, 3-5 pillars, and
   anything they never want said.
2. **Pick the next pillar by rotation**, not by whichever is easiest to write.
   Bump `rotation` and save it, so the next run doesn't repeat the same angle.
3. **Write in the voice**, respect the `avoid` list, and pull the CTA from the
   theme's list instead of reusing one line forever.
4. **Adapt per platform.** The theme sets *what* is said; the per-platform limits
   and structure in [caption-format.md](caption-format.md) decide *how* it's cut.
   Same idea, three lengths — long on LinkedIn, tight on X, hook-first on TikTok.
5. **Tag the post/idea with the pillar id** so performance can be attributed
   later — `get_analytics` joined back by post id tells you which pillar earns
   attention and which one to drop.

## The Ideas board as the backlog

`create_idea` puts a themed idea on the kanban with `tags` — use the pillar id
as one of them. That gives a standing backlog per pillar: brainstorm a batch,
leave them in "Unassigned", and promote them into real posts when the slot comes
up. Tags are for filtering the board only; they never reach a platform, so any
hashtag still belongs in the caption text.

## Keeping it honest

A theme constrains style, never facts. Don't let a pillar's angle push you into
inventing a number, a customer quote, or a result the user never reported. If a
pillar has nothing true to say this week, rotate to the next one.
