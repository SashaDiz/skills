---
name: posteahora
description: "Social media scheduling & publishing CLI — plan, schedule and publish posts across Instagram, TikTok, YouTube, X (Twitter), Facebook, LinkedIn, Threads, Bluesky and Discord, powered by PosteAhora."
allowed-tools:
  - Bash(posteahora:*)
---

# PosteAhora

Schedule and publish social media posts across every major network from the
command line, powered by [PosteAhora](https://posteahora.com). Use this skill to
create, schedule, publish and manage social content, organize a content-idea
backlog, upload media, and read analytics on the user's behalf.

## Install PosteAhora CLI if it doesn't exist

Check whether the CLI is available:

```bash
posteahora --version
```

If it isn't installed:

```bash
npm install -g @posteahora/cli
# or
pnpm install -g @posteahora/cli
```

The installed command is `posteahora`. It can also run via `npx @posteahora/cli`.

**Official resources**
- Website: https://posteahora.com
- Docs: https://posteahora.com/docs
- API reference: https://posteahora.com/docs/api
- CLI on npm: https://www.npmjs.com/package/@posteahora/cli
- CLI on GitHub: https://github.com/posteahora/cli
- MCP server: https://github.com/posteahora/mcp

| Property | Value |
|----------|-------|
| **name** | posteahora |
| **description** | Social media scheduling CLI for publishing across Instagram, TikTok, YouTube, X, Facebook, LinkedIn, Threads, Bluesky and Discord |
| **command** | `posteahora` |
| **allowed-tools** | Bash(posteahora:*) |

## ⚠️ Authentication Required

You MUST authenticate before running any other command. Every command fails
without a valid key.

Check status first:

```bash
posteahora auth
```

If not authenticated, the user creates an API key in the app under
**Settings → API & integrations** (it looks like `pah_live_…`), then:

```bash
posteahora auth --key pah_live_xxxxxxxx
```

The key is validated and stored in `~/.posteahora/config.json`. It can also be
supplied via the `POSTEAHORA_API_KEY` environment variable (useful in CI). Never
print, log, or echo the key.

## Core workflow

Follow this order for any publishing task:

1. **Authenticate** — `posteahora auth`
2. **Discover accounts** — `posteahora accounts` to get the account ID for each
   platform. You cannot post without an explicit account ID.
3. **Upload media** (optional) — `posteahora upload <file>` → returns a public URL
   to pass to `--media`.
4. **Create / schedule / publish** — `posteahora post …`
5. **Verify** — `posteahora posts` (or `--json`) to confirm status.
6. **Analyze** (optional) — `posteahora analytics`.

## Command reference

### Authentication

```bash
posteahora auth --key pah_live_xxxx   # save & validate a key
posteahora auth                       # show current status
posteahora logout                     # remove the saved key
```

### Accounts

```bash
posteahora accounts          # human-readable table
posteahora accounts --json   # machine-readable
```

Each row includes `platform`, `username`, the account `id`, and connection status.
Use the `id` in `--to platform:accountId`.

### Create a post

```bash
# Publish now to one or more channels
posteahora post "Launch day 🚀" --to twitter:a1b2 --to linkedin:c3d4

# Schedule for a future time (ISO 8601)
posteahora post "Morning tip" --to instagram:e5f6 --at 2026-07-20T09:00:00Z

# Draft only (nothing goes live)
posteahora post "Draft idea" --to twitter:a1b2 --draft

# With uploaded media
posteahora upload ./reel.mp4
posteahora post "New reel" --to instagram:e5f6 --media https://cdn.posteahora.com/… --at 2026-07-20T09:00:00Z
```

**`post` options**
- `--to platform:accountId` — target channel (repeatable or comma-separated) **(required)**
- `--media <url>` — attach media (repeatable; from `upload`)
- `--at <ISO 8601>` — schedule for a future time (else publish now)
- `--draft` — create a draft instead of publishing
- `--title`, `--hashtags a,b`, `--media-type image|video`, `--post-type post|reel|story`
- `--json` — machine-readable output

### Manage & analyze

```bash
posteahora posts --status scheduled          # list posts by status
posteahora ideas add "5 hooks" --tags launch # add a backlog idea
posteahora ideas list
posteahora analytics --period 30d            # performance across platforms
posteahora upload ./photo.jpg                # upload media → public URL
```

## Handling account IDs

The user will describe channels by name ("post to my Instagram and X"). Map each
name to a real account ID by running `posteahora accounts` and matching the
`platform`/`username`. Never guess an ID, and never fall back to "the first
account" — if a requested platform has no connected account, tell the user and
skip it.

## Guardrails

- **Publishing is outward-facing and hard to undo.** Before running
  `posteahora post` WITHOUT `--draft`, confirm the caption, channels, and time
  with the user. When unsure, create a `--draft` and ask.
- Scheduled times must be in the future and ISO 8601.
- Never invent media URLs, analytics numbers, or claims in captions.
- Respect each platform's limits (e.g. X character count) — offer a per-platform
  caption instead of silently truncating.
- If a command fails, report the exact error message and stop; do not retry blindly.
- Never print or store the API key.

## Errors

- **"No API key…"** — run `posteahora auth --key pah_live_…` (or set
  `POSTEAHORA_API_KEY`).
- **`--at must be in the future`** — the scheduled time is in the past; pick a
  future ISO 8601 timestamp.
- **`Invalid --to …`** — the value isn't `platform:accountId`; run
  `posteahora accounts` and use a real ID.
- **HTTP 401 / 403** — key invalid or lacking scope; re-auth with a full-access key.
- **HTTP 429** — rate limited; wait and retry.

## See also

- [QUICK_START.md](QUICK_START.md) — the fastest path to a published post.
- [FEATURES.md](FEATURES.md) — full capability list.
- [PLATFORMS.md](PLATFORMS.md) — per-platform support.
- [PUBLISHING.md](PUBLISHING.md) — how publishing & scheduling work.
- [SUPPORTED_FILE_TYPES.md](SUPPORTED_FILE_TYPES.md) — accepted media formats.
- [examples/](examples/) — ready-to-run command examples.
