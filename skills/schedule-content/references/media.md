# Media — creating, uploading and attaching visuals

PosteAhora hosts and publishes the media; **you generate it**. Any image the
agent can produce — a generated image, a rendered chart, a screenshot, a slide
built with a script, a file the user hands over — becomes a post the same way.

## The upload flow

The MCP server usually runs remotely and cannot read local files, so uploading
is a presigned two-step you drive yourself:

1. **`create_upload_url`** with `filename`, the exact `sizeBytes`, and
   `contentType`. It returns `{ uploadUrl, publicUrl, expiresInSeconds }`.
2. **`PUT` the raw bytes** to `uploadUrl` with the same `Content-Type` header.
   Expect HTTP 200.
   ```bash
   curl -T ./slide-1.jpg "<uploadUrl>" -H 'Content-Type: image/jpeg'
   ```
3. **Use `publicUrl`** in `mediaUrls` on `create_post` / `schedule_post` (or in
   `create_idea`, to park the visual with the idea).

The presigned URL expires in about 5 minutes — call `create_upload_url` and
upload immediately, one file at a time, rather than minting a batch up front.

`upload_media` (server-side path) only works when the MCP server can actually
read the file. From a hosted connector it can't — use `create_upload_url`.

**Never invent a media URL.** Only attach a `publicUrl` an upload actually
returned, or a URL the user supplied.

## Generating the image first

When the user wants a visual and hasn't supplied one, produce the file with
whatever image capability you have — an image-generation tool, a render script,
a headless-browser screenshot of an HTML template — write it to disk, then run
the upload flow above. Two things decide whether it looks right:

- **Render at the target aspect ratio**, don't crop later. The platform will
  center-crop anything that doesn't fit, and that's what eats headlines.
- **Keep text inside the safe area.** TikTok and Instagram Stories overlay their
  own UI: a caption/username bar along the bottom and an action-icon column down
  the right. Keep meaningful text roughly 15% off the bottom and 12% off the
  right, or the platform's chrome sits on top of it.

For a recurring visual style, keep the prompt/template and the palette in the
theme file (see [content-themes.md](content-themes.md)) so every post in a
series looks like it belongs to the same account instead of being re-invented.

## Per-platform media rules

These are the constraints PosteAhora enforces (`PLATFORM_CONFIG`).

| Platform | Post type | Media |
|---|---|---|
| Instagram | post | up to 10 images/videos (carousel) |
| | story | 1 image/video, 9:16 |
| | reel | 1 video, 9:16 |
| TikTok | post (Photos) | up to 35 images — **JPEG only** |
| | reel (Video) | 1 video, 9:16 |
| YouTube | video | 1 video, 16:9 |
| | reel (Short) | 1 video, 9:16 |
| | post (Community) | up to 20 images |
| X (Twitter) | post | up to 4 images **or** 1 video |
| Facebook | post | up to 10 images/videos |
| | reel | 1 video, 9:16, 3–90s |
| LinkedIn | post | up to 20 images **or** 1 video — never both |
| Threads | post | up to 20 images/videos |
| Bluesky | post | up to 4 images (no video) |
| Discord | message | up to 10 images/videos |

Accepted formats: JPEG, PNG, WebP, GIF, MP4, MOV, WebM, M4V. Upload cap 500 MB.

Dimensions that render well: **1080×1350** (4:5, the tallest Instagram feed
allows — takes the most screen), **1080×1080** (1:1), **1080×1920** (9:16 for
reels/stories/TikTok), **1920×1080** (16:9 for YouTube).

## Traps worth knowing

- **TikTok photos must be JPEG.** A PNG fails with `file_format_check_failed`.
  Convert before uploading.
- **TikTok verifies URL ownership** — its media has to be served from
  `cdn.posteahora.com`, i.e. it must go through `create_upload_url`. Your own
  CDN will be rejected.
- **Pass `mediaType` explicitly** (`"image"` or `"video"`). It decides TikTok's
  photo vs video endpoint; guessing from the file extension is the fallback, not
  the plan.
- **Use `postType: "reel"`** for vertical video on Instagram and Facebook —
  otherwise it goes out as a feed video.
- **Facebook rejects some third-party image hosts.** Media uploaded through
  PosteAhora always works; an arbitrary external URL may not.
- **Check what actually rendered.** After a carousel upload, confirm every URL
  returns HTTP 200 before scheduling — a broken slide publishes as a blank frame.
