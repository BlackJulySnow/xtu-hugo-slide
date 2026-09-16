---
name: paddle-structure
description: Use when extracting structured content from a local PDF or image with a Paddle Structure layout-parsing API and saving markdown plus related images to local files.
---

# Paddle Structure

Use this skill to parse a local PDF or image file into markdown with layout-aware output.

## Requirements

- `uv`
- `PADDLE_STRUCTURE_TOKEN`
- `PADDLE_STRUCTURE_URL`

## Command

```bash
uv run {baseDir}/scripts/run_paddle_structure.py --file "/absolute/path/to/paper.pdf" --output-dir output/paper-structure
```

## Output

The script writes:

- `doc_<i>.md`
- downloaded images referenced by `markdown.images`
- downloaded images from `outputImages`

## Notes

- PDF files use `fileType=0`
- image files use `fileType=1`
- the script prints saved file paths as it writes them
