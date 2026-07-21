# Caption formatting — the contract

A caption is published **byte for byte**. PosteAhora never trims, re-wraps or
normalizes whitespace, so whatever you send is exactly what the audience reads.
Every spacing decision is yours, and a caption that arrives as one dense block
is a caption you formatted wrong — not a platform quirk.

## Block structure

Build the caption out of **blocks** separated by one empty line. Inside a block
(a list, an address, consecutive short lines), use a single line break.

```
Hook line

Short CTA or question

🍷 Feature one
🏞 Feature two
🥂 Feature three

Closing CTA

Link line

#hashtag #hashtag #hashtag
```

Not every post needs every block — a two-line update is fine. What matters is
that whatever blocks exist are separated the same way.

**Put a short CTA near the top, not only at the end.** TikTok and Instagram
truncate the caption in-feed after a line or two; a CTA that lives under five
bullets is invisible to most viewers. Keep the closing CTA too — just don't rely
on it alone.

## Hard rules

1. **Exactly one empty line between blocks.** Single line break inside a block.
   Never three or more line breaks in a row — the extra gap reads as a mistake.
2. **Emit real line breaks, not escape sequences.** In an MCP tool argument the
   caption is a JSON string: a real newline is what you want. If you write a
   backslash followed by `n`, the post literally shows `\n` to readers.
3. **No Markdown.** Social platforms render it verbatim: `**bold**` shows the
   asterisks, `- item` shows the dash, `#Heading` becomes a hashtag, and
   `[text](url)` shows the brackets. Use emoji or numbers for bullets and plain
   text for emphasis. (Discord is the one exception — it does render Markdown.)
4. **No leading whitespace, no trailing whitespace.** Never indent a caption
   line to make it look aligned in your editor — the indent ships.
5. **Hashtags live inside the caption**, as the last block after an empty line.
   The separate `hashtags` field (and the CLI's `--hashtags`) is stored on the
   post but never reaches the platform, so hashtags passed that way silently
   disappear.
6. **No URL in Instagram or TikTok captions.** Instagram doesn't linkify caption
   URLs, and TikTok penalizes (and has banned) posts with links in the caption.
   Write "link in bio" / "link in profile" instead. URLs are fine on Facebook,
   LinkedIn, Threads, X, Bluesky and Discord.

## Per-platform limits and behavior

Limits below are the ones PosteAhora enforces (`PLATFORM_CONFIG`).

| Platform | Caption limit | What to watch |
|---|---:|---|
| Instagram | 2200 | Empty lines survive. Hashtags as the final block. Caption URLs are not clickable → "link in bio". |
| TikTok | 4000 (photo description), 2200 (video) | Truncated very early in-feed → hook + CTA in the first line or two. **No URLs.** A photo post also needs `photoTitle` (≤90) in `platformOptions.tiktok`. |
| X (Twitter) | 280 (25000 with premium) | Every line break costs a character. Usually one or two blocks; skip long lists. |
| Threads | 500 | The tightest real limit — a caption written for Instagram will usually overflow. Emoji can count as 2+. |
| Bluesky | 300 **graphemes** | Counted in graphemes, not UTF-16 units, so emoji and accents cost differently than you'd guess. |
| LinkedIn | 3000 | Collapsed behind "see more" after ~3 lines → front-load the hook. Empty lines render well. |
| Facebook | 63206 | Long captions fine; a full URL is allowed and expands into a preview. |
| YouTube | 5000 | Description field; only the first ~2 lines show under the video. |
| Discord | 2000 | The one platform where Markdown works. |

## Per-platform captions

When one caption can't serve every channel (almost always the case once Threads,
X or Bluesky are involved), pass overrides instead of truncating:

```json
{
  "caption": "the shared caption",
  "platformCaptions": {
    "threads": "a version under 500 chars",
    "twitter": "a version under 280 chars"
  },
  "accountMappings": [
    { "platform": "instagram", "accountId": "…" },
    { "platform": "threads", "accountId": "…" },
    { "platform": "twitter", "accountId": "…" }
  ]
}
```

Two things to know:

- `platformCaptions` applies when the post is **scheduled or published** — each
  channel becomes its own post row carrying its own caption. A **draft** stays a
  single row and keeps only the shared `caption`; the overrides are applied when
  it is later published, not stored on the draft.
- It is an **MCP/API-only** field. The CLI has no flag for it.

Because of the draft behavior, keep the shared `caption` within the tightest
limit among the targeted platforms whenever that's practical — then even a
dropped override can't produce an overflow.

## Multi-line captions from the CLI

The CLI passes the caption through as a raw positional argument. Inside double
quotes the shell does **not** turn a backslash-n into a line break, so
`posteahora post "line one\nline two"` publishes the characters `\n` verbatim.

Use a heredoc:

```bash
CAPTION=$(cat <<'EOF'
Hook line

🍷 Feature one
🥂 Feature two

Which one would you pick?

#tag #tag
EOF
)

posteahora post "$CAPTION" --to instagram:ACCOUNT_ID
```

A real multi-line double-quoted string works too. ANSI-C quoting (`$'a\nb'`)
also works in bash/zsh, but the heredoc stays readable as the caption grows.

## Check before publishing

- Blocks separated by exactly one empty line; no 3+ consecutive breaks.
- No literal `\n` visible in the text.
- No Markdown syntax.
- No leading or trailing whitespace on any line.
- Hashtags inside the caption, not in the `hashtags` field.
- No URL in the Instagram or TikTok caption.
- Each target platform's caption is within its limit — override where it isn't.
