#!/usr/bin/env node
// 幻灯片视觉 QA：逐页检查内容溢出、图片缺失、KaTeX 渲染错误，并输出逐页截图。
//
// 用法：
//   npm run build
//   node scripts/check-deck.cjs <deck-url> [幻灯片数]
//
// 示例：
//   node scripts/check-deck.cjs http://127.0.0.1:1313/demo-report/ 3
//
// 截图与 JSON 报告输出到 output/<deck-name>-qa/。
// 不传幻灯片数时只做检查，不校验页数。

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('用法：node scripts/check-deck.cjs <deck-url> [幻灯片数]');
    process.exitCode = 1;
    return;
  }

  const expected = process.argv[3] === undefined ? null : Number(process.argv[3]);
  const name = url.replace(/\/+$/, '').split('/').pop() || 'deck';
  const output = path.resolve('output', `${name}-qa`);
  fs.mkdirSync(output, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);

    const count = await page.locator('.xtu-slide-container').count();
    if (expected !== null) {
      assert.equal(count, expected, `幻灯片数量不符：实际 ${count}，期望 ${expected}`);
    }

    // 第 0 页是封面，其后是 count 张幻灯片
    const report = [];
    for (let index = 0; index <= count; index++) {
      await page.evaluate(i => window.XtuSlideShow(i), index);
      await page.waitForTimeout(70);
      const state = await page.evaluate(() => {
        const slide = document.querySelector('.xtu-slide-container.is-active, .xtu-cover-main.is-active');
        const root = slide.querySelector('.xtu-md-root');
        const bounds = (slide.querySelector('.xtu-slide-card') || slide).getBoundingClientRect();
        const overflow = root
          ? [...root.querySelectorAll('p, li, table, figure, .katex-display')]
              .filter(node => {
                const rect = node.getBoundingClientRect();
                return rect.bottom > bounds.bottom + 2 || rect.right > bounds.right + 2 || rect.left < bounds.left - 2;
              })
              .map(node => node.textContent.trim().slice(0, 90))
          : [];
        return {
          title: slide.querySelector('h1')?.textContent,
          overflow,
          missingImages: [...slide.querySelectorAll('img')]
            .filter(img => !img.complete || !img.naturalWidth)
            .map(img => img.src),
          mathErrors: slide.querySelectorAll('.katex-error').length,
          unrenderedMath: root ? /\$/.test(root.innerText) : false,
        };
      });
      report.push({ index, ...state });
      await page.screenshot({ path: path.join(output, `slide-${String(index).padStart(2, '0')}.png`) });
    }

    fs.writeFileSync(
      path.join(output, 'report.json'),
      JSON.stringify({ url, slides: count, pages: report, errors }, null, 2)
    );

    const problems = report.filter(row =>
      row.overflow.length || row.missingImages.length || row.mathErrors || row.unrenderedMath);
    for (const row of problems) {
      console.error(`第 ${row.index} 页有问题：`, JSON.stringify(row));
    }
    if (errors.length) {
      console.error('页面 JS 报错：', errors);
    }

    assert.equal(problems.length, 0, '存在渲染问题的幻灯片');
    assert.equal(errors.length, 0, '存在浏览器 JS 报错');
    console.log(`检查通过：共 ${count + 1} 页，截图与报告输出到 ${output}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
