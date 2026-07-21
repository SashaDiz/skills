# Slide text overlays


This step uses `node-canvas` to render text directly onto your slide images. The text sizing, positioning, and styling below are dialled in from hundreds of posts — this is what turns a raw image into a slide that reads at a glance while someone scrolls.

## Setting Up node-canvas

Before you can add text overlays, your human needs to install `node-canvas`. Prompt them:

> "To add text overlays to the slides, I need a library called node-canvas. It renders text directly onto images with full control over sizing, positioning, and styling.
>
> Can you run this in your terminal?"
>
> ```bash
> npm install canvas
> ```
>
> "If that fails, it's because node-canvas needs some system libraries. Here's what to install first:"
>
> **macOS:**
> ```bash
> brew install pkg-config cairo pango libpng jpeg giflib librsvg
> npm install canvas
> ```
>
> **Ubuntu/Debian:**
> ```bash
> sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
> npm install canvas
> ```
>
> **Windows:**
> ```bash
> # node-canvas auto-downloads prebuilt binaries on Windows
> npm install canvas
> ```
>
> "Once installed, I can handle everything else — generating the overlays, sizing the text, positioning it perfectly. You won't need to touch this again."

**Don't skip this step.** Without node-canvas, the text overlays won't work. If installation fails, help them troubleshoot — it's usually a missing system library. Once it's installed once, it stays.

## How the Text Overlay Process Works

1. **Load the raw slide image** into a node-canvas
2. **Configure text settings** based on the text length for that specific slide
3. **Draw the text** with white fill and thick black outline
4. **Review the output** — check sizing, positioning, readability
5. **Adjust and re-render** if anything looks off
6. **Save the final image** once it looks right

**The exact overlay code:**

```javascript
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function addOverlay(imagePath, text, outputPath) {
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // ─── Adjust font size based on text length ───
  const wordCount = text.split(/\s+/).length;
  let fontSizePercent;
  if (wordCount <= 5)       fontSizePercent = 0.075;  // Short: 75px on 1024w
  else if (wordCount <= 12) fontSizePercent = 0.065;  // Medium: 66px
  else                      fontSizePercent = 0.050;  // Long: 51px

  const fontSize = Math.round(img.width * fontSizePercent);
  const outlineWidth = Math.round(fontSize * 0.15);
  const maxWidth = img.width * 0.75;
  const lineHeight = fontSize * 1.3;

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // ─── Word wrap ───
  const lines = [];
  const manualLines = text.split('\n');
  for (const ml of manualLines) {
    const words = ml.trim().split(/\s+/);
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  // ─── Position: centered at ~28% from top ───
  const totalHeight = lines.length * lineHeight;
  const startY = (img.height * 0.28) - (totalHeight / 2);
  const x = img.width / 2;

  // ─── Draw each line ───
  for (let i = 0; i < lines.length; i++) {
    const y = startY + (i * lineHeight);

    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = outlineWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(lines[i], x, y);

    // White fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(lines[i], x, y);
  }

  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
}
```

**Key details that make the slides look professional:**

- **Dynamic font sizing** — short text gets bigger (75px), long text gets smaller (51px). Every slide is optimized.
- **Word wrap** — respects manual `\n` breaks but also auto-wraps lines that exceed 75% width. No squashing.
- **Centered at 28% from top** — text block is vertically centered around this point, not pinned to it. Stays in the safe zone regardless of line count.
- **Thick outline** — 15% of font size. Makes text readable on ANY background.
- **Manual line breaks preferred** — use `\n` in your text for control. Keep lines to 4-6 words.

**Text content rules:**
- **REACTIONS not labels** — "Wait... this is actually nice??" not "Modern minimalist"
- **4-6 words per line** — short lines are scannable at a glance
- **3-4 lines per slide is ideal**
- **No emoji** — canvas can't render them reliably
- **Safe zones:** No text in bottom 20% (TikTok controls) or top 10% (status bar)

**The difference between OK slides and viral slides is in these details.** Slides consistently hit high view counts because the text is sized right, positioned right, and readable at a glance while scrolling.

**⚠️ LINE BREAKS ARE CRITICAL — Read This:**

The `texts.json` file must contain text with `\n` line breaks to control where lines wrap. If you pass a single long string without line breaks, the script will auto-wrap, but **manual breaks look much better** because you control the rhythm.

**Good (manual breaks, 4-6 words per line):**
```json
[
  "I showed my landlord\nwhat AI thinks our\nkitchen should look like",
  "She said you can't\nchange anything\nchallenge accepted",
  "So I downloaded\nthis app and\ntook one photo",
  "Wait... is this\nactually the same\nkitchen??",
  "Okay I'm literally\nobsessed with\nthis one",
  "This app showed me\nwhat's possible\nlink in bio"
]
```

**Bad (no breaks — will auto-wrap but looks worse):**
```json
[
  "I showed my landlord what AI thinks our kitchen should look like",
  ...
]
```

**Rules for writing overlay text:**
1. **4-6 words per line MAX** — short lines are scannable at a glance
2. **Use `\n` to break lines** — gives you control over the rhythm
3. **3-4 lines per slide is ideal** — more lines are fine, they won't overflow
4. **Read it out loud** — each line should feel like a natural pause
5. **No emoji** — canvas can't render them, they'll show as blank
6. **REACTIONS not labels** — "Wait... this is nice??" not "Modern minimalist"

The script auto-wraps any line that exceeds 75% width as a safety net, but always prefer manual `\n` breaks for the best visual result.

