/**
 * slide-preprocessor.js
 *
 * Parses content.md files in deck directories and generates JSON data files
 * at data/decks/<deck>.json for the Hugo template to render as a single page.
 *
 * Usage:
 *   node scripts/slide-preprocessor.js              # process all decks
 *   node scripts/slide-preprocessor.js --deck name  # process single deck
 *   node scripts/slide-preprocessor.js --clean      # remove generated files
 *   node scripts/slide-preprocessor.js --migrate    # convert multi-file to content.md
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '..', 'content');
const DATA_DIR = path.resolve(__dirname, '..', 'data', 'decks');

// ─── CLI ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const opts = {
  deck: null,
  clean: false,
  migrate: false,
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--deck' && args[i + 1]) {
    opts.deck = args[++i];
  } else if (args[i] === '--clean') {
    opts.clean = true;
  } else if (args[i] === '--migrate') {
    opts.migrate = true;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────

function main() {
  const decks = listDecks();
  let changed = 0;

  for (const deck of decks) {
    if (opts.deck && deck !== opts.deck) continue;
    const deckPath = path.join(CONTENT_DIR, deck);
    const contentMd = path.join(deckPath, 'content.md');

    if (opts.clean) {
      const removed = cleanDeck(deckPath, deck);
      if (removed > 0) {
        console.log(`  [clean] ${deck}: removed ${removed} file(s)`);
        changed++;
      }
      continue;
    }

    if (opts.migrate) {
      if (fs.existsSync(contentMd)) {
        console.log(`  [skip] ${deck}: already has content.md`);
        continue;
      }
      const migrated = migrateDeck(deckPath, deck);
      if (migrated) changed++;
      continue;
    }

    if (!fs.existsSync(contentMd)) continue;

    try {
      const count = processDeck(deckPath, deck, contentMd);
      console.log(`  [ok] ${deck}: generated JSON with ${count} slide(s)`);
      changed++;
    } catch (err) {
      console.error(`  [error] ${deck}: ${err.message}`);
      process.exit(1);
    }
  }

  if (changed === 0 && !opts.clean) {
    console.log('  No content.md files found.');
  }
}

// ─── Deck listing ──────────────────────────────────────────────────────

function listDecks() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((name) => {
    const full = path.join(CONTENT_DIR, name);
    return fs.statSync(full).isDirectory();
  });
}

// ─── Parse content.md ──────────────────────────────────────────────────

/**
 * Parse content.md into:
 *   { deckMeta: {...}, slides: [{ order, section_key, section_title, subsection_title, body }] }
 *
 * Strategy: state machine that identifies slide boundaries by `---\norder:` pattern.
 */
function parseContentMd(text) {
  const lines = text.split('\n');
  let state = 'initial'; // 'initial' | 'in-deck-meta' | 'between' | 'in-slide-meta'
  let deckMetaLines = [];
  let slideMetaLines = [];
  let bodyLines = [];
  const slides = [];
  const errors = [];

  let slideIndex = 0; // 1-based

  function emitSlide() {
    const metaText = slideMetaLines.join('\n');
    const body = bodyLines.join('\n');
    const meta = parseYamlBlock(metaText);

    if (meta.order === undefined || meta.order === null) {
      errors.push(`Slide ${slideIndex}: missing 'order' field`);
      return;
    }
    const order = Number(meta.order);
    if (!Number.isInteger(order) || order < 1) {
      errors.push(`Slide ${slideIndex}: 'order' must be a positive integer (got: ${meta.order})`);
      return;
    }
    if (!meta.subsection_title) {
      console.warn(`  [warn] Slide ${slideIndex} (order=${order}): missing 'subsection_title'`);
    }

    slides.push({
      order,
      section_key: meta.section_key || '',
      section_title: meta.section_title || '',
      subsection_title: meta.subsection_title || '',
      body,
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (state === 'initial') {
      if (trimmed === '---') {
        state = 'in-deck-meta';
        continue;
      }
    } else if (state === 'in-deck-meta') {
      if (trimmed === '---') {
        state = 'between';
        continue;
      }
      deckMetaLines.push(line);
    } else if (state === 'between') {
      // Look for slide frontmatter start: `---` followed by a line starting with `order:`
      if (trimmed === '---' && i + 1 < lines.length && /^\s*[a-zA-Z_]\w*\s*:/.test(lines[i + 1])) {
        slideIndex++;
        slideMetaLines = [];
        bodyLines = [];
        state = 'in-slide-meta';
        continue;
      }
      // Also handle: `---` at end of file with no more content (just trailing newline)
      if (trimmed === '---') {
        // Could be the closing of a previous slide meta; handle below
        continue;
      }
      // Any content outside slide boundaries is ignored (shouldn't happen in well-formed files)
    } else if (state === 'in-slide-meta') {
      if (trimmed === '---') {
        // End of slide frontmatter, switch to body
        state = 'slide-body';
        continue;
      }
      slideMetaLines.push(line);
    } else if (state === 'slide-body') {
      // Check if this is a new slide boundary
      if (trimmed === '---' && i + 1 < lines.length && /^\s*[a-zA-Z_]\w*\s*:/.test(lines[i + 1])) {
        emitSlide();
        slideIndex++;
        slideMetaLines = [];
        bodyLines = [];
        state = 'in-slide-meta';
        continue;
      }
      // Check if this is a trailing `---` at end of file (shouldn't happen but be safe)
      if (trimmed === '---') {
        // Could be accidental markdown hr at end — treat as body
        bodyLines.push(line);
        continue;
      }
      bodyLines.push(line);
    }
  }

  // Emit last slide if any
  if (state === 'slide-body' && slideMetaLines.length > 0) {
    emitSlide();
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  // Check for duplicate orders
  const orderSet = new Set();
  for (const slide of slides) {
    if (orderSet.has(slide.order)) {
      throw new Error(`Duplicate order=${slide.order}`);
    }
    orderSet.add(slide.order);
  }

  return { deckMeta: parseYamlBlock(deckMetaLines.join('\n')), slides };
}

function parseYamlBlock(text) {
  const obj = {};
  for (const line of text.split('\n')) {
    const m = /^(\w+)\s*:\s*(.*)/.exec(line);
    if (m) {
      let val = m[2].trim();
      // Strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      obj[m[1]] = val;
    }
  }
  return obj;
}

// ─── Process deck ──────────────────────────────────────────────────────

function processDeck(deckPath, deckName, contentMdPath) {
  const text = fs.readFileSync(contentMdPath, 'utf-8');
  const { deckMeta, slides } = parseContentMd(text);

  // Ensure output directory exists
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const jsonPath = path.join(DATA_DIR, `${deckName}.json`);
  const jsonData = {
    title: deckMeta.title || '',
    presenter: deckMeta.presenter || '',
    report_date: deckMeta.report_date || '',
    summary: deckMeta.summary || '',
    slides: slides.map((s) => ({
      order: s.order,
      section_key: s.section_key,
      section_title: s.section_title,
      subsection_title: s.subsection_title,
      body: s.body,
    })),
  };

  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  return slides.length;
}

// ─── Clean ─────────────────────────────────────────────────────────────

function cleanDeck(deckPath, deckName) {
  let count = 0;
  // Remove generated JSON
  const jsonPath = path.join(DATA_DIR, `${deckName}.json`);
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
    count++;
  }
  // Remove old generated slide-NN.md files
  const files = fs.readdirSync(deckPath);
  for (const f of files) {
    if (!/^slide-\d+\.md$/.test(f)) continue;
    const filePath = path.join(deckPath, f);
    const text = fs.readFileSync(filePath, 'utf-8');
    // Old generated files have the GENERATED_MARKER
    if (text.includes('GENERATED by slide-preprocessor')) {
      fs.unlinkSync(filePath);
      count++;
    }
  }
  return count;
}

// ─── Migrate ───────────────────────────────────────────────────────────

function migrateDeck(deckPath, deckName) {
  // Read _index.md for deck-level metadata
  const indexPath = path.join(deckPath, '_index.md');
  let deckMeta = {};
  if (fs.existsSync(indexPath)) {
    const indexText = fs.readFileSync(indexPath, 'utf-8');
    const match = /^---\n([\s\S]*?)\n---/.exec(indexText);
    if (match) {
      deckMeta = parseYamlBlock(match[1]);
    }
  }

  // Read all slide files (excluding _index.md and non-.md files)
  const files = fs.readdirSync(deckPath);
  const slideFiles = files.filter(
    (f) => f.endsWith('.md') && f !== '_index.md' && f !== 'content.md'
  );

  if (slideFiles.length === 0) {
    console.log(`  [skip] ${deckName}: no slide files to migrate`);
    return false;
  }

  // Parse each slide
  const slides = [];
  for (const f of slideFiles) {
    const filePath = path.join(deckPath, f);
    const text = fs.readFileSync(filePath, 'utf-8');
    const metaMatch = /^---\n([\s\S]*?)\n---\n?([\s\S]*)/s.exec(text);
    if (!metaMatch) continue;
    const meta = parseYamlBlock(metaMatch[1]);
    const body = (metaMatch[2] || '').trim();
    slides.push({ meta, body });
  }

  slides.sort((a, b) => (a.meta.order || 999) - (b.meta.order || 999));

  // Build content.md
  const parts = ['---'];
  if (deckMeta.title) parts.push(`title: ${deckMeta.title}`);
  if (deckMeta.presenter) parts.push(`presenter: ${deckMeta.presenter}`);
  if (deckMeta.report_date) parts.push(`report_date: ${deckMeta.report_date}`);
  if (deckMeta.summary) parts.push(`summary: ${deckMeta.summary}`);
  parts.push('---\n');

  for (const slide of slides) {
    parts.push('---');
    if (slide.meta.section_key) parts.push(`section_key: ${slide.meta.section_key}`);
    if (slide.meta.section_title) parts.push(`section_title: ${slide.meta.section_title}`);
    if (slide.meta.subsection_title) parts.push(`subsection_title: ${slide.meta.subsection_title}`);
    parts.push(`order: ${slide.meta.order}`);
    parts.push('---');
    parts.push(slide.body);
    parts.push('');
  }

  const contentMd = path.join(deckPath, 'content.md');
  fs.writeFileSync(contentMd, parts.join('\n'), 'utf-8');
  console.log(`  [migrate] ${deckName}: created content.md with ${slides.length} slide(s)`);
  console.log(`    Run with --clean --deck ${deckName} to remove old slide files after verification.`);
  return true;
}

// ─── Run ───────────────────────────────────────────────────────────────

main();
