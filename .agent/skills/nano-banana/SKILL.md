---
name: nano-banana
description: Generate or edit images via Gemini image preview models using OpenRouter API.
homepage: https://openrouter.ai/
metadata:
  {
    "openclaw":
      {
        "emoji": "🍌",
        "requires": { "bins": ["uv"], "env": ["OPENROUTER_API_KEY"] },
        "primaryEnv": "OPENROUTER_API_KEY",
        "install":
          [
            {
              "id": "uv-brew",
              "kind": "brew",
              "formula": "uv",
              "bins": ["uv"],
              "label": "Install uv (brew)",
            },
          ],
      },
  }
---

# Nano Banana (Gemini Image Preview via OpenRouter)

Use the bundled script to generate or edit images.

Generate

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "your image description" --filename "output.png" --resolution 1K
```

指定模型

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "your image description" --filename "output.png" --model google/gemini-3.1-flash-image-preview
```

Edit (single image)

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "edit instructions" --filename "output.png" -i "/path/in.png" --resolution 2K
```

Multi-image composition (up to 14 images)

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "combine these into one scene" --filename "output.png" -i img1.png -i img2.png -i img3.png
```

API key

- `OPENROUTER_API_KEY` env var
- Or set `skills."nano-banana".apiKey` / `skills."nano-banana".env.OPENROUTER_API_KEY` in `~/.openclaw/openclaw.json`

Specific aspect ratio (optional)

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "portrait photo" --filename "output.png" --aspect-ratio 9:16
```

Notes

- Supported models: `google/gemini-3-pro-image-preview`, `google/gemini-3.1-flash-image-preview`.
- Resolutions: `1K` (default), `2K`, `4K`.
- Aspect ratios: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`. Without `--aspect-ratio` / `-a`, the model picks freely - use this flag for avatars, profile pics, or consistent batch generation.
- Use timestamps in filenames: `yyyy-mm-dd-hh-mm-ss-name.png`.
- The script prints a `MEDIA:` line for OpenClaw to auto-attach on supported chat providers.
- Do not read the image back; report the saved path only.
