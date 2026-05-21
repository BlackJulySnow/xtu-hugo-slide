const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('child_process');

// ─── Inline parser for unit tests ──────────────────────────────────────

function parseYamlBlock(text) {
  const obj = {};
  for (const line of text.split('\n')) {
    const m = /^(\w+)\s*:\s*(.*)/.exec(line);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      obj[m[1]] = val;
    }
  }
  return obj;
}

function parseContentMd(text) {
  const lines = text.split('\n');
  let state = 'initial';
  let slideMetaLines = [];
  let bodyLines = [];
  const slides = [];
  const errors = [];
  let slideIndex = 0;

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
      if (trimmed === '---') state = 'in-deck-meta';
    } else if (state === 'in-deck-meta') {
      if (trimmed === '---') state = 'between';
    } else if (state === 'between') {
      if (trimmed === '---' && i + 1 < lines.length && /^\s*[a-zA-Z_]\w*\s*:/.test(lines[i + 1])) {
        slideIndex++;
        slideMetaLines = [];
        bodyLines = [];
        state = 'in-slide-meta';
        continue;
      }
    } else if (state === 'in-slide-meta') {
      if (trimmed === '---') {
        state = 'slide-body';
        continue;
      }
      slideMetaLines.push(line);
    } else if (state === 'slide-body') {
      if (trimmed === '---' && i + 1 < lines.length && /^\s*[a-zA-Z_]\w*\s*:/.test(lines[i + 1])) {
        emitSlide();
        slideIndex++;
        slideMetaLines = [];
        bodyLines = [];
        state = 'in-slide-meta';
        continue;
      }
      bodyLines.push(line);
    }
  }

  if (state === 'slide-body' && slideMetaLines.length > 0) emitSlide();

  if (errors.length > 0) throw new Error(errors.join('; '));

  const orderSet = new Set();
  for (const slide of slides) {
    if (orderSet.has(slide.order)) throw new Error(`Duplicate order=${slide.order}`);
    orderSet.add(slide.order);
  }

  return slides;
}

// ─── Parser unit tests ─────────────────────────────────────────────────

test('parses multiple slides from content.md', () => {
  const content = `---
title: Test Deck
presenter: John
report_date: 2026-01-01
---

---
order: 1
section_key: intro
section_title: Introduction
subsection_title: Background
---

First slide content.

---
order: 2
section_key: intro
section_title: Introduction
subsection_title: Method
---

Second slide content with **bold** text.
`;

  const slides = parseContentMd(content);
  assert.equal(slides.length, 2);
  assert.equal(slides[0].order, 1);
  assert.equal(slides[0].section_key, 'intro');
  assert.equal(slides[0].subsection_title, 'Background');
  assert.ok(slides[0].body.includes('First slide content'));
  assert.equal(slides[1].order, 2);
  assert.equal(slides[1].subsection_title, 'Method');
  assert.ok(slides[1].body.includes('Second slide content'));
});

test('throws on missing order', () => {
  const content = `---\ntitle: Test\n---\n\n---\nsection_key: intro\nsubsection_title: No Order\n---\n\nContent without order.\n`;
  assert.throws(() => parseContentMd(content), /missing 'order' field/);
});

test('throws on non-integer order', () => {
  const content = `---\ntitle: Test\n---\n\n---\norder: abc\nsubsection_title: Bad Order\n---\n\nContent.\n`;
  assert.throws(() => parseContentMd(content), /order.*positive integer/);
});

test('throws on negative order', () => {
  const content = `---\ntitle: Test\n---\n\n---\norder: -1\nsubsection_title: Bad Order\n---\n\nContent.\n`;
  assert.throws(() => parseContentMd(content), /order.*positive integer/);
});

test('throws on duplicate orders', () => {
  const content = `---\ntitle: Test\n---\n\n---\norder: 1\nsubsection_title: First\n---\n\nContent 1.\n\n---\norder: 1\nsubsection_title: Second\n---\n\nContent 2.\n`;
  assert.throws(() => parseContentMd(content), /Duplicate order=1/);
});

test('body horizontal rules (---) are not misinterpreted as slide boundaries', () => {
  const content = `---\ntitle: Test\n---\n\n---\norder: 1\nsection_key: intro\nsubsection_title: Slide With HR\n---\n\nSome text above.\n\n---\n\nSome text below.\n`;
  const slides = parseContentMd(content);
  assert.equal(slides.length, 1);
  assert.ok(slides[0].body.includes('Some text above'));
  assert.ok(slides[0].body.includes('---'));
  assert.ok(slides[0].body.includes('Some text below'));
});

test('body content preserves markdown formatting', () => {
  const content = `---\ntitle: Test\n---\n\n---\norder: 1\nsection_key: intro\nsubsection_title: Formatted\n---\n\n- bullet one\n- bullet two\n\n![caption](assets/fig.png "w=80%")\n\n| Header | Value |\n|--------|-------|\n| A      | 1     |\n`;
  const slides = parseContentMd(content);
  assert.equal(slides.length, 1);
  assert.ok(slides[0].body.includes('- bullet one'));
  assert.ok(slides[0].body.includes('![caption]'));
  assert.ok(slides[0].body.includes('| Header |'));
});

test('empty body is allowed', () => {
  const content = `---\ntitle: Test\n---\n\n---\norder: 1\nsubsection_title: Empty\n---\n`;
  const slides = parseContentMd(content);
  assert.equal(slides.length, 1);
  assert.equal(slides[0].body, '');
});

// ─── Integration test: preprocessor generates JSON ─────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data', 'decks');

test('integration: preprocessor generates JSON for paper-style-energy-core-report-20260514', () => {
  execSync(`node ${path.join(PROJECT_ROOT, 'scripts', 'slide-preprocessor.js')} --deck paper-style-energy-core-report-20260514`, {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
  });

  const jsonPath = path.join(DATA_DIR, 'paper-style-energy-core-report-20260514.json');
  assert.ok(fs.existsSync(jsonPath), 'JSON file should exist');

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  assert.equal(data.title, 'Global Thermodynamic Consistency in Multi-Agent Retrosynthesis Planning');
  assert.equal(data.presenter, '刘晴瑞');
  assert.ok(Array.isArray(data.slides));
  assert.equal(data.slides.length, 15);

  // Verify first slide
  assert.equal(data.slides[0].order, 1);
  assert.equal(data.slides[0].section_title, '背景与相关工作');
  assert.equal(data.slides[0].subsection_title, '问题定义');
  assert.ok(data.slides[0].body.includes('单步逆合成'));

  // Verify all orders are unique
  const orders = data.slides.map((s) => s.order);
  assert.equal(new Set(orders).size, orders.length, 'All orders should be unique');
});

test('integration: clean removes JSON file', () => {
  const jsonPath = path.join(DATA_DIR, 'paper-style-energy-core-report-20260514.json');
  // Ensure it exists first
  assert.ok(fs.existsSync(jsonPath));

  execSync(`node ${path.join(PROJECT_ROOT, 'scripts', 'slide-preprocessor.js')} --clean --deck paper-style-energy-core-report-20260514`, {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
  });

  assert.ok(!fs.existsSync(jsonPath), 'JSON file should be removed');
});

// ─── Test readDeckJson ─────────────────────────────────────────────────

test('readDeckJson reads deck JSON and returns slide count', () => {
  // Ensure JSON exists
  execSync(`node ${path.join(PROJECT_ROOT, 'scripts', 'slide-preprocessor.js')} --deck paper-style-energy-core-report-20260514`, {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
  });

  const { readDeckJson } = require('../scripts/export-pdf-lib');
  const data = readDeckJson(PROJECT_ROOT, 'paper-style-energy-core-report-20260514');
  assert.equal(data.title, 'Global Thermodynamic Consistency in Multi-Agent Retrosynthesis Planning');
  assert.equal(data.totalSlides, 15);
  assert.ok(Array.isArray(data.slides));
  assert.equal(data.slides[0].subsection_title, '问题定义');
});
