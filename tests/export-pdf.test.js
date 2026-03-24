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
  resolveRoute,
  readSlideConfig,
} = require('../scripts/export-pdf-lib');

test('parseArgs requires a deck name and derives a default output path', () => {
  const result = parseArgs(['--deck', 'energyKG-2026-03-20']);

  assert.equal(result.deck, 'energyKG-2026-03-20');
  assert.equal(result.output, path.join('output', 'energyKG-2026-03-20.pdf'));
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
  const deckRoot = path.join(publicRoot, 'energykg-2026-03-20');

  fs.mkdirSync(path.join(deckRoot, '01-intro'), { recursive: true });
  fs.mkdirSync(path.join(deckRoot, '02-method'), { recursive: true });

  fs.writeFileSync(
    path.join(deckRoot, 'index.html'),
    '<main class="xtu-cover-main" data-next="/energykg-2026-03-20/01-intro/"></main>',
    'utf8'
  );
  fs.writeFileSync(
    path.join(deckRoot, '01-intro', 'index.html'),
    'var nextUrl = "/energykg-2026-03-20/02-method/";',
    'utf8'
  );
  fs.writeFileSync(
    path.join(deckRoot, '02-method', 'index.html'),
    'var nextUrl = "";',
    'utf8'
  );

  const routes = collectDeckRouteChain(publicRoot, 'energykg-2026-03-20');

  assert.deepEqual(routes, [
    '/energykg-2026-03-20/',
    '/energykg-2026-03-20/01-intro/',
    '/energykg-2026-03-20/02-method/',
  ]);
});

test('collectDeckRouteChain resolves relative nextUrl values', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xtu-export-pdf-rel-'));
  const publicRoot = path.join(tmpRoot, 'public');
  const deckRoot = path.join(publicRoot, 'group-meeting-2026-03-25');

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

  const routes = collectDeckRouteChain(publicRoot, 'group-meeting-2026-03-25');

  assert.deepEqual(routes, [
    '/group-meeting-2026-03-25/',
    '/group-meeting-2026-03-25/01-intro/',
    '/group-meeting-2026-03-25/02-method/',
  ]);
});

test('resolveRoute keeps absolute routes and normalizes relative routes', () => {
  assert.equal(
    resolveRoute('/group-meeting-2026-03-25/', './01-intro/'),
    '/group-meeting-2026-03-25/01-intro/'
  );
  assert.equal(
    resolveRoute('/group-meeting-2026-03-25/01-intro/', '../02-method/'),
    '/group-meeting-2026-03-25/02-method/'
  );
  assert.equal(
    resolveRoute('/group-meeting-2026-03-25/', '/group-meeting-2026-03-25/01-intro/'),
    '/group-meeting-2026-03-25/01-intro/'
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
        if (entry.name === 'docs') {
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
