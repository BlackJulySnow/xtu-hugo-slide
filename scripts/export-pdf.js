#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');

const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');

const {
  collectDeckRouteChain,
  getExportViewport,
  parseArgs,
  readSlideConfig,
} = require('./export-pdf-lib');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'content');
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');
const HUGO_CONFIG_PATH = path.join(PROJECT_ROOT, 'hugo.toml');

function resolveDeckContentDir(deck) {
  const deckDir = path.join(CONTENT_ROOT, deck);

  if (!fs.existsSync(deckDir) || !fs.statSync(deckDir).isDirectory()) {
    throw new Error(`Deck content folder not found: ${deckDir}`);
  }

  return deckDir;
}

function resolveDeckPublicDir(deck) {
  const candidates = [deck, deck.toLowerCase()];

  for (const candidate of candidates) {
    const indexPath = path.join(PUBLIC_ROOT, candidate, 'index.html');
    if (fs.existsSync(indexPath)) {
      return candidate;
    }
  }

  const target = deck.toLowerCase();
  const entries = fs.readdirSync(PUBLIC_ROOT, { withFileTypes: true });
  const matched = entries.find((entry) => (
    entry.isDirectory() &&
    entry.name.toLowerCase() === target &&
    fs.existsSync(path.join(PUBLIC_ROOT, entry.name, 'index.html'))
  ));

  if (matched) {
    return matched.name;
  }

  throw new Error(`Deck public output not found for "${deck}". Build may have failed.`);
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

function getMimeType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.ico':
      return 'image/x-icon';
    case '.txt':
    case '.md':
      return 'text/plain; charset=utf-8';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}

function createStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const safePath = decodedPath.replace(/^\/+/, '');
    let filePath = path.resolve(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve, closeReject) => {
          server.close((error) => {
            if (error) {
              closeReject(error);
              return;
            }
            closeResolve();
          });
        }),
      });
    });
  });
}

async function waitForPageReady(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete),
    { timeout: 15000 }
  );
  await page.evaluate(async () => {
    if (!document.fonts || !document.fonts.ready) {
      return;
    }

    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  });
  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(250);
}

async function renderDeckPdfBuffers(baseUrl, routes) {
  const viewport = getExportViewport(HUGO_CONFIG_PATH);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  const buffers = [];

  try {
    await page.emulateMedia({ media: 'screen' });

    for (const route of routes) {
      const targetUrl = `${baseUrl}${route}`;
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await waitForPageReady(page);
      const pdfBuffer = await page.pdf({
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
        printBackground: true,
        preferCSSPageSize: false,
      });
      buffers.push(pdfBuffer);
    }
  } finally {
    await browser.close();
  }

  return buffers;
}

async function mergePdfBuffers(buffers) {
  const merged = await PDFDocument.create();

  for (const buffer of buffers) {
    const source = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) {
      merged.addPage(page);
    }
  }

  return Buffer.from(await merged.save());
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  readSlideConfig(HUGO_CONFIG_PATH);
  resolveDeckContentDir(args.deck);

  await runCommand('hugo', ['--cleanDestinationDir'], PROJECT_ROOT);

  const deckPublicDir = resolveDeckPublicDir(args.deck);
  const routes = collectDeckRouteChain(PUBLIC_ROOT, deckPublicDir);
  const outputPath = path.isAbsolute(args.output)
    ? args.output
    : path.resolve(PROJECT_ROOT, args.output);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const server = await createStaticServer(PUBLIC_ROOT);
  try {
    const pageBuffers = await renderDeckPdfBuffers(server.baseUrl, routes);
    const mergedPdf = await mergePdfBuffers(pageBuffers);
    fs.writeFileSync(outputPath, mergedPdf);
  } finally {
    await server.close();
  }

  console.log(`Exported ${routes.length} pages to ${outputPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
