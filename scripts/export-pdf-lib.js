const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SLIDE_CONFIG = Object.freeze({
  designWidth: 1280,
  designHeight: 720,
  bodyFontPx: 35.2,
  titleFontPx: 84.48,
  headingScale: 0.9,
  navTitleFontPx: 18.3,
  coverTitleFontPx: 65.47,
  coverMetaFontPx: 21.47,
  captionFontPx: 18,
});

function parseArgs(argv) {
  let deck = '';
  let output = '';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--deck') {
      deck = argv[i + 1] || '';
      i += 1;
      continue;
    }

    if (arg === '--output') {
      output = argv[i + 1] || '';
      i += 1;
    }
  }

  if (!deck) {
    throw new Error('--deck is required');
  }

  return {
    deck,
    output: output || path.join('output', `${deck}.pdf`),
  };
}

function extractCoverNextUrl(html) {
  const match = html.match(/data-next="([^"]+)"/);
  return match ? match[1] : '';
}

function extractNextUrl(html) {
  const match = html.match(/var\s+nextUrl\s*=\s*"([^"]*)";/);
  return match ? match[1] : '';
}

function routeToHtmlPath(publicRoot, routePath) {
  const cleanRoute = routePath.replace(/^\/+|\/+$/g, '');
  return path.join(publicRoot, cleanRoute, 'index.html');
}

function resolveRoute(baseRoute, targetRoute) {
  if (!targetRoute) return '';
  if (targetRoute.startsWith('/')) return targetRoute;

  const resolved = path.posix.resolve(baseRoute, targetRoute);
  return resolved.endsWith('/') ? resolved : `${resolved}/`;
}

function collectDeckRouteChain(publicRoot, deckPublicDir) {
  const routes = [];
  const seen = new Set();
  const coverRoute = `/${deckPublicDir}/`;
  const coverHtmlPath = routeToHtmlPath(publicRoot, coverRoute);

  if (!fs.existsSync(coverHtmlPath)) {
    throw new Error(`Deck HTML not found: ${coverHtmlPath}`);
  }

  const coverHtml = fs.readFileSync(coverHtmlPath, 'utf8');
  let currentRoute = coverRoute;
  let nextRoute = resolveRoute(currentRoute, extractCoverNextUrl(coverHtml));

  routes.push(coverRoute);
  seen.add(coverRoute);

  while (nextRoute) {
    if (seen.has(nextRoute)) {
      throw new Error(`Detected slide navigation loop at ${nextRoute}`);
    }

    const slideHtmlPath = routeToHtmlPath(publicRoot, nextRoute);
    if (!fs.existsSync(slideHtmlPath)) {
      throw new Error(`Slide HTML not found: ${slideHtmlPath}`);
    }

    routes.push(nextRoute);
    seen.add(nextRoute);

    const slideHtml = fs.readFileSync(slideHtmlPath, 'utf8');
    currentRoute = nextRoute;
    nextRoute = resolveRoute(currentRoute, extractNextUrl(slideHtml));
  }

  return routes;
}

function parseTomlScalar(value) {
  const trimmed = value.trim();

  if (/^".*"$/.test(trimmed)) {
    return trimmed.slice(1, -1);
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function readSlideConfig(configPath) {
  const config = { ...DEFAULT_SLIDE_CONFIG };
  const content = fs.readFileSync(configPath, 'utf8');
  const lines = content.split(/\r?\n/);
  let section = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }

    if (section !== 'params.slide') {
      continue;
    }

    const keyValueMatch = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!keyValueMatch) {
      continue;
    }

    const [, key, rawValue] = keyValueMatch;
    if (!(key in config)) {
      continue;
    }

    config[key] = parseTomlScalar(rawValue);
  }

  return config;
}

function computeHeadingFontSizes(titleFontPx, bodyFontPx, headingScale = 0.9) {
  const h2FontPx = titleFontPx * headingScale;

  if (!(h2FontPx > bodyFontPx)) {
    return Array.from({ length: 5 }, () => bodyFontPx);
  }

  const ratio = Math.pow(bodyFontPx / h2FontPx, 1 / 4);
  return [
    h2FontPx,
    h2FontPx * Math.pow(ratio, 1),
    h2FontPx * Math.pow(ratio, 2),
    h2FontPx * Math.pow(ratio, 3),
    bodyFontPx,
  ];
}

function getExportViewport(configPath) {
  const config = configPath ? readSlideConfig(configPath) : DEFAULT_SLIDE_CONFIG;
  return {
    width: config.designWidth,
    height: config.designHeight,
  };
}

module.exports = {
  collectDeckRouteChain,
  computeHeadingFontSizes,
  getExportViewport,
  parseArgs,
  resolveRoute,
  readSlideConfig,
};
