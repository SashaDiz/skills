---
name: posteahora
description: "Social media scheduling CLI — publish and schedule posts across Instagram, X, LinkedIn, Threads, Facebook, TikTok and more, powered by PosteAhora."
allowed-tools:
  - Bash(posteahora:*)
---

# PosteAhora

Schedule and publish social posts across every major network from the command
line, powered by [PosteAhora](https://posteahora.com). This skill lets an agent
create, schedule and publish content, manage ideas, read analytics and upload
media on the user's behalf.

## Install PosteAhora CLI if it doesn't exist

```bash
npm install -g @posteahora/cli
# or
pnpm install -g @posteahora/cli
```

The installed command is `posteahora`. You can also run it without installing via
`npx @posteahora/cli <command>`.

**Official resources**
- npm: https://www.npmjs.com/package/@posteahora/cli
- CLI on GitHub: https://github.com/posteahora/cli
- MCP server (for agents that prefer MCP over a CLI): https://github.com/posteahora/mcp
- API reference: https://posteahora.com/docs
- Website: https://posteahora.com

| Property | Value |
|----------|-------|
| **name** | posteahora |
| **description** | Social media scheduling CLI for publishing across Instagram, X, LinkedIn, Threads, Facebook, TikTok and more |
| **command** | `posteahora` |
| **allowed-tools** | Bash(posteahora:*) |

## ⚠️ Authentication Required

You MUST authenticate before running any other command. Every command fails
without a valid key.

First, check the current auth status:

```bash
posteahora auth
```

If not authenticated, the user creates an API key in the app under
**Settings → API & integrations** (it looks like `pah_live_…`), then:

```bash
posteahora auth --key pah_live_xxxxxxxx
```

The key is validated and stored in `~/.posteahora/config.json`. It can also be
supplied per-run via the `POSTEAHORA_API_KEY` environment variable.

## Core workflow

1. **Authenticate** — `posteahora auth`
2. **List accounts** — `posteahora accounts` (you need each account's ID to post)
3. **Upload media** (optional) — `posteahora upload <file>` → returns a public URL
4. **Create / schedule / publish** — `posteahora post …`
5. **Check status** — `posteahora posts`
6. **Analyze** — `posteahora analytics`

## Essential commands

```bash
# Auth
posteahora auth --key pah_live_xxxx   # save & validate a key
posteahora auth                       # show status
posteahora logout                     # remove the saved key

# Accounts (get the account IDs used for posting)
posteahora accounts

# Publish now to one or more channels (platform:accountId from `accounts`)
posteahora post "Launch day 🚀" --to twitter:a1b2 --to linkedin:c3d4

# Schedule for a future time (ISO 8601), with media
posteahora upload ./reel.mp4          # prints a public URL
posteahora post "New reel" --to instagram:e5f6 \
  --media https://cdn.posteahora.com/… --at 2026-07-20T09:00:00Z

# Draft only
posteahora post "Rough idea" --to twitter:a1b2 --draft

# Posts, ideas, analytics
posteahora posts --status scheduled
posteahora ideas add "5 hooks for launch week" --tags launch,eng
posteahora ideas list
posteahora analytics --period 30d
```

Add `--json` to most commands for machine-readable output.

### `post` options
- `--to platform:accountId` — target channel (repeatable or comma-separated)
- `--media <url>` — attach media (repeatable; use `upload` to get a URL)
- `--at <ISO 8601>` — schedule for a future time (otherwise publishes now)
- `--draft` — create a draft instead of publishing
- `--title`, `--hashtags a,b`, `--media-type image|video`, `--post-type post|reel|story`

## Supported platforms

Instagram · TikTok · YouTube · X (Twitter) · Facebook · LinkedIn · Threads ·
Bluesky · Discord

## Guardrails

- **Publishing is outward-facing and hard to undo** — confirm the caption,
  channels and time with the user before running `posteahora post` without
  `--draft`. When unsure, create a `--draft`.
- Always run `posteahora accounts` first; never guess an account ID.
- Never invent media URLs, analytics numbers, or claims in captions.
- If a command fails, report the exact error and stop — don't retry blindly.
