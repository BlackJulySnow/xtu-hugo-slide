const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  computeHeadingFontSizes,
  parseArgs,
  collectDeckRouteChain,
  getExportViewport,
  readDeckJson,
  resolveRoute,
  readSlideConfig,
} = require('../scripts/export-pdf-lib');

test('readDeckJson reads a single-file deck without _index.md', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'single-file-deck-'));
  const deckDir = path.join(tmpRoot, 'content', 'demo');
  fs.mkdirSync(deckDir, { recursive: true });
  fs.writeFileSync(path.join(deckDir, 'content.md'), [
    '---',
    'title: Demo Deck',
    'presenter: Demo Presenter',
    'template: hnu',
    '---',
    '',
    '---',
    'section_key: intro',
    'section_title: Intro',
    'subsection_title: First',
    'order: 1',
    '---',
    'Body',
    '',
    '---',
    'section_key: hidden',
    'section_title: Hidden',
    'subsection_title: Hidden slide',
    'order: 2',
    'hidden: true',
    '---',
    'Hidden body',
    '',
  ].join('\n'));

  const result = readDeckJson(tmpRoot, 'demo');
  assert.equal(result.title, 'Demo Deck');
  assert.equal(result.presenter, 'Demo Presenter');
  assert.equal(result.totalSlides, 1);
});

test('parseArgs requires a deck name and derives a default output path', () => {
  const result = parseArgs(['--deck', 'demo-report']);

  assert.equal(result.deck, 'demo-report');
  assert.equal(result.output, path.join('output', 'demo-report.pdf'));
});

test('parseArgs throws when deck is missing', () => {
  assert.throws(
    () => parseArgs([]),
    /--deck is required/
  );
});

test('collectDeckRouteChain follows the cover page and nextUrl chain', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xtu-export-pdf-'));
  const publicRoot = path.join(tmpRoot, 'public');
  const deckRoot = path.join(publicRoot, 'demo-report');

  fs.mkdirSync(path.join(deckRoot, '01-intro'), { recursive: true });
  fs.mkdirSync(path.join(deckRoot, '02-method'), { recursive: true });

  fs.writeFileSync(
    path.join(deckRoot, 'index.html'),
    '<main class="xtu-cover-main" data-next="/demo-report/01-intro/"></main>',
    'utf8'
  );
  fs.writeFileSync(
    path.join(deckRoot, '01-intro', 'index.html'),
    'var nextUrl = "/demo-report/02-method/";',
    'utf8'
  );
  fs.writeFileSync(
    path.join(deckRoot, '02-method', 'index.html'),
    'var nextUrl = "";',
    'utf8'
  );

  const routes = collectDeckRouteChain(publicRoot, 'demo-report');

  assert.deepEqual(routes, [
    '/demo-report/',
    '/demo-report/01-intro/',
    '/demo-report/02-method/',
  ]);
});

test('collectDeckRouteChain resolves relative nextUrl values', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xtu-export-pdf-rel-'));
  const publicRoot = path.join(tmpRoot, 'public');
  const deckRoot = path.join(publicRoot, 'demo-report');

  fs.mkdirSync(path.join(deckRoot, '01-intro'), { recursive: true });
  fs.mkdirSync(path.join(deckRoot, '02-method'), { recursive: true });

  fs.writeFileSync(
    path.join(deckRoot, 'index.html'),
    '<main class="xtu-cover-main" data-next="./01-intro/"></main>',
    'utf8'
  );
  fs.writeFileSync(
    path.join(deckRoot, '01-intro', 'index.html'),
    'var nextUrl = "../02-method/";',
    'utf8'
  );
  fs.writeFileSync(
    path.join(deckRoot, '02-method', 'index.html'),
    'var nextUrl = "";',
    'utf8'
  );

  const routes = collectDeckRouteChain(publicRoot, 'demo-report');

  assert.deepEqual(routes, [
    '/demo-report/',
    '/demo-report/01-intro/',
    '/demo-report/02-method/',
  ]);
});

test('resolveRoute keeps absolute routes and normalizes relative routes', () => {
  assert.equal(
    resolveRoute('/demo-report/', './01-intro/'),
    '/demo-report/01-intro/'
  );
  assert.equal(
    resolveRoute('/demo-report/01-intro/', '../02-method/'),
    '/demo-report/02-method/'
  );
  assert.equal(
    resolveRoute('/demo-report/', '/demo-report/01-intro/'),
    '/demo-report/01-intro/'
  );
});

test('readSlideConfig reads slide sizing from hugo.toml', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xtu-export-config-'));
  const configPath = path.join(tmpRoot, 'hugo.toml');

  fs.writeFileSync(configPath, [
    '[params.slide]',
    'designWidth = 1920',
    'designHeight = 1080',
    'bodyFontPx = 35.2',
    'titleFontPx = 84.48',
    'headingScale = 0.9',
    'navTitleFontPx = 18.3',
    'coverTitleFontPx = 65.47',
    'coverMetaFontPx = 21.47',
    'captionFontPx = 32',
    '',
  ].join('\n'));

  assert.deepEqual(readSlideConfig(configPath), {
    designWidth: 1920,
    designHeight: 1080,
    bodyFontPx: 35.2,
    titleFontPx: 84.48,
    headingScale: 0.9,
    navTitleFontPx: 18.3,
    coverTitleFontPx: 65.47,
    coverMetaFontPx: 21.47,
    captionFontPx: 32,
  });
});

test('getExportViewport uses hugo.toml for rendering and PDF sizing', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xtu-export-viewport-'));
  const configPath = path.join(tmpRoot, 'hugo.toml');

  fs.writeFileSync(configPath, [
    '[params.slide]',
    'designWidth = 1920',
    'designHeight = 1080',
    '',
  ].join('\n'));

  assert.deepEqual(getExportViewport(configPath), {
    width: 1920,
    height: 1080,
  });
});

test('computeHeadingFontSizes uses headingScale for h2 and reaches body at h6', () => {
  const title = 84.48;
  const body = 35.2;
  const headingScale = 0.9;
  const sizes = computeHeadingFontSizes(title, body, headingScale);

  assert.equal(sizes.length, 5);
  assert.ok(Math.abs(sizes[0] - (title * headingScale)) < 1e-9);
  assert.ok(Math.abs(sizes[4] - body) < 1e-9);
  assert.ok(sizes[0] > sizes[1] && sizes[1] > sizes[2] && sizes[2] > sizes[3] && sizes[3] > sizes[4]);

  const ratioA = sizes[2] / sizes[1];
  const ratioB = sizes[3] / sizes[2];
  const ratioC = sizes[4] / sizes[3];

  assert.ok(Math.abs(ratioA - ratioB) < 1e-9);
  assert.ok(Math.abs(ratioB - ratioC) < 1e-9);
});

test('content markdown does not contain level-1 headings', () => {
  const contentRoot = path.resolve(__dirname, '..', 'content');
  const stack = [contentRoot];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'docs' || entry.name === 'papers') {
          continue;
        }
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  const offenders = files.filter((filePath) => /^# /m.test(fs.readFileSync(filePath, 'utf8')));
  assert.deepEqual(offenders, []);
});

test('slide markdown avoids ambiguous bold delimiters before CJK text', () => {
  const contentRoot = path.resolve(__dirname, '..', 'content');
  const stack = [contentRoot];
  const offenders = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'docs' && entry.name !== 'papers') {
          stack.push(fullPath);
        }
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) {
        continue;
      }

      const source = fs.readFileSync(fullPath, 'utf8');
      if (/\*\*[^*\n]+：\*\*(?=[\p{Script=Han}A-Za-z0-9])/u.test(source)) {
        offenders.push(fullPath);
      }
    }
  }

  assert.deepEqual(offenders, []);
});

test('categorized decks export by original name and reject ambiguous names', () => {
  const { resolveDeckContentDir } = require('../scripts/export-pdf-lib');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'categorized-decks-'));
  try {
    fs.mkdirSync(path.join(root, 'data'));
    fs.writeFileSync(path.join(root, 'data', 'content_categories.json'), JSON.stringify([
      { id: 'research' }, { id: 'examples' },
    ]));
    for (const category of ['research', 'examples']) {
      fs.mkdirSync(path.join(root, 'content', category), { recursive: true });
    }
    const deck = path.join(root, 'content', 'research', 'demo');
    fs.mkdirSync(deck);
    fs.writeFileSync(path.join(deck, 'content.md'), '---\ntitle: Demo\n---\n\n---\norder: 1\n---\nSlide\n');
    assert.equal(resolveDeckContentDir(root, 'demo'), deck);
    assert.equal(readDeckJson(root, 'demo').totalSlides, 1);
    assert.throws(() => resolveDeckContentDir(root, 'missing'), /found 0/);
    fs.mkdirSync(path.join(root, 'content', 'examples', 'demo'));
    assert.throws(() => resolveDeckContentDir(root, 'demo'), /found 2/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
