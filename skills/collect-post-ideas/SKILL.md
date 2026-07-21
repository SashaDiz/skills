---
name: collect-post-ideas
description: >
  Brainstorm social post ideas for the user's niche and push them into the
  PosteAhora kanban (Ideas board → "Unassigned" column) using the posteahora MCP
  tools. Trigger on "collect post ideas", "give me some ideas", "fill my ideas
  board", "brainstorm post ideas", "add ideas to PosteAhora", or similar.
---

# Collect post ideas → PosteAhora kanban

Use this when the user wants a batch of fresh post ideas dropped straight into
their PosteAhora Ideas board. The board is the backlog — this skill only creates
**ideas**, never publishes anything.

## Inputs to gather (ask only if missing)
- **Niche / topic** (e.g. "journaling app Mulu", "personal founder brand").
- **How many** ideas (default 8).
- **Language / tone** (default: match the user's message language).
- Optional **tags** to attach (e.g. `eng`, `mulu`).

## Steps
1. If niche is unclear, ask one short clarifying question. Otherwise proceed.
2. Generate the requested number of distinct ideas. For each idea produce:
   - a short **title** (≤ 60 chars),
   - a draft **caption** (1–3 sentences, on-brand, hook-first),
   - 2–4 **tags**.
   Vary angles: educational, story, contrarian, behind-the-scenes, social proof,
   question/poll, listicle, before/after.

   **Write the caption already publish-ready.** An idea gets promoted into a real
   post, and whatever text is in it ships byte for byte:

   ```
   Hook line

   Body — one or two sentences, or emoji-led lines one per line

   #hashtag #hashtag
   ```

   - One empty line between blocks; a single line break inside a list.
   - Real line breaks, not the two characters `\n`.
   - No Markdown — `**bold**`, `- bullets` and `[links](url)` render literally.
   - Hashtags belong in the caption text, not in `tags` (tags are for filtering
     the board; they never reach a platform).
3. For **each** idea, call the `create_idea` tool with:
   `{ title, caption, tags, status: "unassigned" }`.
   Call it once per idea (do not batch into one call).
4. After all ideas are created, summarize what landed: a numbered list of the
   titles, and tell the user they're in the Ideas board under "Unassigned",
   ready to drag into Todo / promote to a post.

## Guardrails
- Never call `create_post`, `schedule_post`, or anything that publishes.
- Don't invent media URLs. Leave `mediaUrls` empty unless the user supplied one.
- If a `create_idea` call fails, report which idea failed and continue with the
  rest — don't abort the whole batch.
- Keep captions free of fabricated stats or claims.
