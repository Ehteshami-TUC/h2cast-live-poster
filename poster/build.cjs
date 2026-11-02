#!/usr/bin/env node
// Renders poster/poster.html into ../poster.jpg and updates the clickable areas (const HOT) in ../index.html.
//
//   node poster/build.cjs                 poster.jpg + hotspots
//   node poster/build.cjs --pdf out.pdf   additionally an A0 PDF (vector text and charts) for printing
//   node poster/build.cjs --check         only report layout problems, write nothing
//   node poster/build.cjs --preview x.jpg  only write a screenshot to x.jpg (index.html and poster.jpg untouched)
//
// Needs Playwright with Chromium (npm i -g playwright && npx playwright install chromium).
// The data of the charts (T27, TB4P, YEAR) is read from index.html, so the poster and the pop-ups show the same numbers.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const args = process.argv.slice(2);
const pdfOut = args.includes('--pdf') ? path.resolve(args[args.indexOf('--pdf') + 1]) : null;
const checkOnly = args.includes('--check');
const preview = args.includes('--preview') ? path.resolve(args[args.indexOf('--preview') + 1]) : null;  // screenshot only

(async () => {
  let html = fs.readFileSync(INDEX, 'utf8');
  const data = ['T27', 'TB4P', 'YEAR'].map(name => {
    const m = html.match(new RegExp(`^const ${name} = (.*);\\s*$`, 'm'));
    if (!m) throw new Error(`const ${name} not found in index.html`);
    return `window.${name} = ${m[1]};`;
  }).join('\n');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2400, height: 3393 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(data);
  await page.goto('file://' + path.join(__dirname, 'poster.html'), { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });

  // ---- layout checks: overflowing columns, broken images, text running out of its box
  const problems = await page.evaluate(() => {
    const out = [];
    for (const c of document.querySelectorAll('.col')) {
      const fill = c.querySelector('.fill');
      const spare = fill ? fill.getBoundingClientRect().height : 0;
      const over = c.scrollHeight - c.clientHeight;
      out.push(`${c.id}: ${over > 1 ? 'OVERFLOWS by ' + over + ' px' : 'spare ' + Math.round(spare) + ' px'}`);
    }
    for (const i of document.images) if (!i.naturalWidth) out.push('image not loaded: ' + i.getAttribute('src'));
    const P = document.querySelector('#poster').getBoundingClientRect();
    for (const e of document.querySelectorAll('#poster *')) {
      const r = e.getBoundingClientRect();
      if (r.width && (r.right > P.right + 0.5 || r.bottom > P.bottom + 0.5)) out.push('outside the poster: ' + e.tagName + '.' + e.className);
    }
    return out;
  });
  console.log(problems.join('\n'));
  if (errors.length) console.log('page errors:\n' + errors.join('\n'));

  // ---- clickable areas, in % of the poster
  const hot = await page.evaluate(() => {
    const P = document.querySelector('#poster').getBoundingClientRect();
    const r2 = v => Math.round(v * 100) / 100;
    return [...document.querySelectorAll('[data-hot]')].map(e => {
      const r = e.getBoundingClientRect(), pad = 8;
      const h = { id: e.dataset.hot, label: e.dataset.label };
      if (e.dataset.menu === 'false') h.menu = false;
      Object.assign(h, { l: r2((r.left - pad - P.left) / P.width * 100), t: r2((r.top - pad - P.top) / P.height * 100),
                         w: r2((r.width + 2 * pad) / P.width * 100), h: r2((r.height + 2 * pad) / P.height * 100) });
      return h;
    });
  });

  if (preview) await page.locator('#poster').screenshot({ path: preview, type: 'jpeg', quality: 90 });
  else if (!checkOnly) {
    await page.locator('#poster').screenshot({ path: path.join(ROOT, 'poster.jpg'), type: 'jpeg', quality: 86 });
    // the FTK scheme of the poster, at double resolution, for the FTK pop-up of the live page
    const p2 = await browser.newPage({ viewport: { width: 2400, height: 3393 }, deviceScaleFactor: 2 });
    await p2.addInitScript(data);
    await p2.goto('file://' + path.join(__dirname, 'poster.html'), { waitUntil: 'load' });
    await p2.evaluate(() => document.fonts.ready);
    await p2.locator('#ftk').screenshot({ path: path.join(ROOT, 'img', 'ftk_scheme.png') });
    await p2.close();
    const line = 'const HOT = ' + JSON.stringify(hot) + ';';
    html = html.replace(/^const HOT = .*;\s*$/m, line);
    fs.writeFileSync(INDEX, html);
    console.log(`poster.jpg and img/ftk_scheme.png written; ${hot.length} clickable areas written to index.html`);
    if (pdfOut) {
      await page.emulateMedia({ media: 'print' });
      await page.pdf({ path: pdfOut, width: '2400px', height: '3393px', printBackground: true, pageRanges: '1' });
      console.log('PDF written: ' + pdfOut + ' (2400 × 3393 px page, scale to A0 = 841 × 1189 mm when printing)');
    }
  }
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exit(1); });
