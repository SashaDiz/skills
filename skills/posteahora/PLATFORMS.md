# Supported Platforms

PosteAhora publishes and schedules across every major social network. Connect
accounts in the app (**Connections**), then target them from the CLI by their
account ID (`posteahora accounts`).

| Platform | Publish | Schedule | Analytics | Notes |
|----------|:------:|:--------:|:---------:|-------|
| **Instagram** | ✅ | ✅ | ✅ | Feed posts, reels, stories; single image, carousel, or video |
| **TikTok** | ✅ | ✅ | ✅ | Video and photo posts; draft mode supported |
| **YouTube** | ✅ | ✅ | ✅ | Video uploads (Shorts and standard) |
| **X (Twitter)** | ✅ | ✅ | ✅ | Text, images, video; shorter per-platform captions supported |
| **Facebook** | ✅ | ✅ | ✅ | Page posts, images, video, reels |
| **LinkedIn** | ✅ | ✅ | ✅ | Text, single/multi-image, video |
| **Threads** | ✅ | ✅ | ✅ | Text and media posts |
| **Bluesky** | ✅ | ✅ | ✅ | Text and images |
| **Discord** | ✅ | ✅ | — | Channel messages via webhook |

## Targeting platforms

Each post targets one or more channels as `platform:accountId` pairs:

```bash
posteahora post "Cross-posting everywhere" \
  --to instagram:a1b2 \
  --to twitter:c3d4 \
  --to linkedin:e5f6 \
  --to threads:g7h8
```

Get the IDs with:

```bash
posteahora accounts
```

## Per-platform options

Use `--post-type` for the content format and `platformOptions` (via the API/MCP)
for platform-specific behavior:

- `--post-type post|reel|story`
- `--media-type image|video`

If a requested platform has no connected account, the CLI reports it — connect it
in the app first. Platform availability depends on each network's API and your
connected account's permissions.
