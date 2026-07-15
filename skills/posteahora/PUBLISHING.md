# Publishing & Scheduling

How posts move from a command to live content across your social networks.

## The three states

A post is created in one of three states, controlled by how you run
`posteahora post`:

| State | How | What happens |
|-------|-----|--------------|
| **Draft** | `--draft` | Saved, not queued. Nothing goes live. |
| **Scheduled** | `--at <ISO 8601>` | Queued to publish at the given future time. |
| **Publish now** | neither flag | Enters the publishing pipeline immediately. |

```bash
# Draft
posteahora post "Idea" --to twitter:a1b2 --draft

# Schedule
posteahora post "Tuesday tip" --to twitter:a1b2 --at 2026-07-20T09:00:00Z

# Publish now
posteahora post "Live now 🚀" --to twitter:a1b2
```

## Multi-platform fan-out

A single command can target many channels. Each channel is published
independently with its own connected account, so one failing platform never
blocks the others:

```bash
posteahora post "Big announcement" \
  --to instagram:a1b2 --to twitter:c3d4 --to linkedin:e5f6
```

## Media

Attach media with `--media`, using public URLs from `posteahora upload`:

```bash
posteahora upload ./cover.jpg          # → https://cdn.posteahora.com/…
posteahora post "With a cover image" --to instagram:a1b2 --media https://cdn.posteahora.com/…
```

Pass `--media` multiple times for carousels. See
[SUPPORTED_FILE_TYPES.md](SUPPORTED_FILE_TYPES.md).

## Scheduling rules

- `--at` must be a **future** ISO 8601 timestamp (e.g. `2026-07-20T09:00:00Z`).
- Times are interpreted in the timezone you provide in the timestamp; use `Z`
  for UTC.
- The CLI validates the time locally before calling the API, so a past time fails
  fast.

## Checking status

After publishing, confirm what happened:

```bash
posteahora posts --status scheduled
posteahora posts --status published
posteahora posts --json
```

Post statuses: `draft`, `scheduled`, `queued`, `published`, `failed`.

## Quotas & limits

Publishing counts against your PosteAhora plan's monthly post quota. The API is
also rate-limited per key (HTTP `429` when exceeded) — space out large batches.
