---
name: hugo-slide
description: Use when maintaining the existing xtu-hugo-sample Hugo slide project in this repository, especially when editing deck content, adjusting slide typography or fixed-canvas settings, preserving the subsection_title and h2-h6 heading rules, or exporting a deck PDF with the local Playwright-based workflow.
---

# Hugo Slide

## Overview

Maintain the existing `xtu-hugo-sample` workflow. Treat this as a project-specific skill, not a generic Hugo tutorial.

Keep changes aligned with the repository's current conventions for content structure, title hierarchy, fixed-size slide rendering, and PDF export.

## Start Here

Inspect the smallest relevant files first:

- `xtu-hugo-sample/content/<deck>/` for slide markdown and frontmatter
- `xtu-hugo-sample/hugo.toml` for slide dimensions and typography
- `xtu-hugo-sample/layouts/_default/baseof.html`
- `xtu-hugo-sample/layouts/_default/single.html`
- `xtu-hugo-sample/static/css/style.css`
- `xtu-hugo-sample/scripts/export-pdf.js`
- `xtu-hugo-sample/scripts/export-pdf-lib.js`
- `xtu-hugo-sample/tests/export-pdf.test.js`

## Project Rules

- Decks live under `xtu-hugo-sample/content/<deck>/`.
- The page header title comes from frontmatter `subsection_title`.
- Do not use Markdown `# ` headings in slide content.
- Body heading levels are `h2-h6` only.
- Fixed canvas size and typography are configured from `xtu-hugo-sample/hugo.toml`.
- `h2` uses `titleFontPx * headingScale`; `h3-h6` scale from there down to `bodyFontPx`.
- Export decks with `npm run export-pdf -- --deck <deck>`.

## Content Workflow

- Prefer editing frontmatter and markdown content before touching templates.
- Keep each slide focused on one idea or one visual cluster.
- When creating or revising slides, ensure `subsection_title` matches the intended page header.
- If you introduce body headings, start at `##` and keep the structure shallow.
- Preserve deck-level metadata in `_index.md`.

## Typography And Layout

- Use `xtu-hugo-sample/hugo.toml` as the single source of truth for slide dimensions and typography.
- When adjusting type scale, update the values in `[params.slide]` instead of hardcoding new font sizes in templates.
- Keep preview and export consistent; avoid reintroducing viewport-based reflow for deck pages.
- If heading behavior changes, update both the template logic and the related tests.

## Export Workflow

Run from `xtu-hugo-sample/`:

```bash
npm run export-pdf -- --deck <deck-folder>
```

This command:

- builds the Hugo site
- follows the deck cover and slide route chain
- renders pages with Playwright
- merges page PDFs into one deck PDF

Default output is `xtu-hugo-sample/output/<deck>.pdf`.

## Validation

Use the smallest relevant verification set:

```bash
node --test tests/export-pdf.test.js
```

Add these when applicable:

```bash
hugo --cleanDestinationDir
npm run export-pdf -- --deck <deck-folder>
```

For heading-rule changes, confirm slide markdown still has no Markdown `# ` headings.

## Common Mistakes

- Turning this into a generic Hugo skill instead of a repo-specific one
- Adding `# ` headings back into slide markdown
- Bypassing `hugo.toml` with hardcoded typography values
- Changing export behavior without updating `tests/export-pdf.test.js`
- Forgetting that deck cover pages and slide pages should stay fixed-canvas and consistent with export
