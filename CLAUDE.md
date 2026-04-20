# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install                    # Install dependencies
npm run dev                    # Local preview (Hugo server at localhost:1313)
npm run build                  # Build static pages (hugo --cleanDestinationDir)
npm test                       # Run all tests
node --test tests/export-pdf.test.js  # Run single test file
npm run export-pdf -- --deck <deck-name>  # Export deck to PDF (outputs to output/<deck>.pdf)
```

## Architecture Overview

This is a Hugo-based slide presentation system for academic group meetings. Each presentation is a "deck" under `content/<deck-name>/`.

### Key Directories

- `content/<deck>/` - Slide markdown files, assets, and docs for each presentation
- `layouts/` - Hugo templates: `list.html` (cover page), `single.html` (slide pages)
- `static/` - Global brand assets (logo, fonts, CSS)
- `scripts/` - PDF export using Playwright + pdf-lib
- `.agent/skills/` - Custom skills for paper processing (paddle-structure, pdf-image-crop, paper-report-assistant, nano-banana)

### Deck Structure

```
content/<deck-name>/_index.md    # Cover: title, presenter, report_date
content/<deck-name>/01-xxx.md    # Slide pages with order-based naming
content/<deck-name>/assets/      # Images for this deck
content/<deck-name>/docs/        # Reference documents (ignored by Hugo)
```

### Slide Frontmatter

Each slide requires these fields:

```yaml
---
section_key: introduction       # Section identifier for navigation
section_title: 引言             # Section title shown in footer nav
subsection_title: 研究背景       # Page header title
order: 1                        # Page sequence number (required, unique)
---
```

### Critical Content Rules

- **Never use `# ` Markdown headings** in slide content - the page title comes from `subsection_title` frontmatter
- Body headings must start at `##` (h2-h6 only)
- Image syntax: `![caption](assets/fig.png "w=80%")` with optional width hint
- `order` field is mandatory and must be unique within a deck

### PDF Export Flow

The `npm run export-pdf -- --deck <deck>` command:
1. Runs `hugo --cleanDestinationDir` to rebuild
2. Starts a static HTTP server for the `public/` output
3. Uses Playwright to render each page at fixed viewport (1920x1080 from hugo.toml)
4. Merges individual page PDFs into one deck PDF

### Typography Configuration

All slide dimensions and font sizes are configured in `hugo.toml` under `[params.slide]`:
- `designWidth`/`designHeight`: Fixed canvas size (1920x1080)
- `titleFontPx`: Page header font size
- `bodyFontPx`: Base body text size
- Do not hardcode font sizes in templates - use hugo.toml values

## Skills Overview

The `.agent/skills/` directory contains custom skills for paper-to-slide workflows:

- **xtu-hugo-slide**: Maintain this Hugo slide project (content, templates, PDF export)
- **paper-report-assistant**: Analyze papers and generate Chinese presentation outlines
- **paddle-structure**: Parse PDF into structured Markdown with images (requires `PADDLE_STRUCTURE_URL`, `PADDLE_STRUCTURE_TOKEN`)
- **pdf-image-crop**: Extract high-resolution figures from PDF (depends on paddle-structure output)
- **nano-banana**: Generate/edit images via Gemini models (requires `OPENROUTER_API_KEY`)