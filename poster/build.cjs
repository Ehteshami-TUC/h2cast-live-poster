#!/usr/bin/env node
// Renders poster/poster.html into ../poster.jpg and updates the clickable areas (const HOT) in ../index.html.
//
//   node poster/build.cjs                  poster.jpg, img/ftk_scheme.png and the clickable areas in index.html
//   node poster/build.cjs --pdf out.pdf    additionally a print PDF, A0 (841 × 1189 mm), vector text and charts
//   node poster/build.cjs --check          only report layout problems, write nothing (exit code 1 if there are any)
//   node poster/build.cjs --preview x.jpg  only write a screenshot to x.jpg (index.html and poster.jpg untouched)
//   node poster/build.cjs --force          write even if the layout check found problems
//
// Setup once: npm install && npx playwright install chromium   (see package.json; then: npm run poster)
// The data of the charts (T27, TB4P, YEAR) is read from index.html, so the poster and the pop-ups show the same numbers.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const args = process.argv.slice(2);
const usage = msg => { console.error(msg + '\nusage: node poster/build.cjs [--pdf out.pdf] [--check] [--preview x.jpg] [--force]'); process.exit(2); };
const fileArg = flag => {
  const i = args.indexOf(flag);
  if (i < 0) return null;
  const v = args[i + 1];
  if (!v || v.startsWith('--')) usage(`${flag} needs a file name`);
  return path.resolve(v);
};
const pdfOut = fileArg('--pdf');
const preview = fileArg('--preview');      // screenshot only
const checkOnly = args.includes('--check');
const force = args.includes('--force');
if (pdfOut && (checkOnly || preview)) usage('--pdf cannot be combined with --check or --preview');

(async () => {
  let html = fs.readFileSync(INDEX, 'utf8');
  const data = ['T27', 'TB4P', 'YEAR'].map(name => {
    const m = html.match(new RegExp(`^const ${name} = (.*);[ \\t]*$`, 'm'));
    if (!m) throw new Error(`const ${name} not found in index.html`);
    return `window.${name} = ${m[1]};`;
  }).join('\n');

  const browser = await chromium.launch();
  const open = async scale => {
    const page = await browser.newPage({ viewport: { width: 2400, height: 3393 }, deviceScaleFactor: scale });
    await page.addInitScript(data);
    await page.goto('file://' + path.join(__dirname, 'poster.html'), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; if (window.partnersReady) await window.partnersReady;
      await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
    return page;
  };
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 2400, height: 3393 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
  // a missing partner logo is expected (shown as text); any other missing file is an error
  page.on('requestfailed', r => { if (!r.url().includes('/img/partners/')) errors.push('missing: ' + r.url()); });
  await page.addInitScript(data);
  await page.goto('file://' + path.join(__dirname, 'poster.html'), { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; if (window.partnersReady) await window.partnersReady;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });

  // ---- layout checks: overflowing or unequal columns, broken images, elements running off the poster
  const { info, problems } = await page.evaluate(() => {
    const info = [], problems = [];
    for (const c of document.querySelectorAll('.col')) {
      const fill = c.querySelector('.fill');
      c.classList.add('measure');                       // headings packed at the top: the spare height collects in .fill
      const spare = fill ? fill.getBoundingClientRect().height : 0;
      c.classList.remove('measure');
      const over = c.scrollHeight - c.clientHeight, w = c.getBoundingClientRect().width;
      if (over > 1) problems.push(`${c.id}: column OVERFLOWS by ${over} px`); else info.push(`${c.id}: spare ${Math.round(spare)} px`);
      if (Math.abs(w - 1000) > 0.5) problems.push(`${c.id}: column is ${w.toFixed(1)} px wide instead of 1000 px`);
    }
    for (const i of document.images) if (!i.naturalWidth) problems.push('image not loaded: ' + i.getAttribute('src'));
    const P = document.querySelector('#poster').getBoundingClientRect();
    for (const e of document.querySelectorAll('#poster *')) {
      const r = e.getBoundingClientRect();
      if (r.width && (r.right > P.right + 0.5 || r.bottom > P.bottom + 0.5)) problems.push('outside the poster: ' + e.tagName + '.' + e.className);
    }
    return { info, problems };
  });
  console.log(info.join('\n'));
  const bad = [...problems, ...errors.map(e => 'page error: ' + e)];
  if (bad.length) console.log('PROBLEMS:\n  ' + bad.join('\n  '));

  // ---- clickable areas, in % of the poster
  const hot = await page.evaluate(() => {
    const P = document.querySelector('#poster').getBoundingClientRect();
    const r2 = v => Math.round(v * 100) / 100;
    return [...document.querySelectorAll('[data-hot]')].map(e => {
      const r = e.getBoundingClientRect(), pad = 8;
      const h = { id: e.dataset.hot, label: e.dataset.label };
      if (e.dataset.menu === 'false') h.menu = false;
      if (e.dataset.tag) h.tag = e.dataset.tag;     // "in": the "explore" tag sits inside the corner (content above)
      Object.assign(h, { l: r2((r.left - pad - P.left) / P.width * 100), t: r2((r.top - pad - P.top) / P.height * 100),
                         w: r2((r.width + 2 * pad) / P.width * 100), h: r2((r.height + 2 * pad) / P.height * 100) });
      return h;
    });
  });

  if (checkOnly) { await browser.close(); process.exit(bad.length ? 1 : 0); }
  if (preview) {
    await page.locator('#poster').screenshot({ path: preview, type: 'jpeg', quality: 90 });
    console.log('preview written: ' + preview);
    await browser.close(); process.exit(bad.length ? 1 : 0);
  }
  if (bad.length && !force) { console.error('Nothing written. Fix the problems above, or run with --force.'); await browser.close(); process.exit(1); }

  const jpg = path.join(ROOT, 'poster.jpg');
  await page.locator('#poster').screenshot({ path: jpg, type: 'jpeg', quality: 86 });
  // the FTK scheme of the poster, at double resolution, for the FTK pop-up of the live page
  const p2 = await open(2);
  await p2.locator('#ftk').screenshot({ path: path.join(ROOT, 'img', 'ftk_scheme.png') });
  await p2.close();

  // clickable areas, and a version tag on poster.jpg so browsers do not combine a cached old image with new areas
  const reHot = /^const HOT = .*;[ \t]*$/m, reImg = /src="poster\.jpg(\?v=[0-9a-f]*)?"/;
  if (!reHot.test(html)) throw new Error('const HOT line not found in index.html');
  if (!reImg.test(html)) throw new Error('<img src="poster.jpg"> not found in index.html');
  const version = crypto.createHash('sha1').update(fs.readFileSync(jpg)).digest('hex').slice(0, 10);
  html = html.replace(reHot, () => 'const HOT = ' + JSON.stringify(hot) + ';').replace(reImg, () => `src="poster.jpg?v=${version}"`);
  fs.writeFileSync(INDEX, html);
  console.log(`poster.jpg (v=${version}) and img/ftk_scheme.png written; ${hot.length} clickable areas written to index.html`);

  if (pdfOut) {
    // A0 = 841 × 1189 mm; the layout is 2400 CSS px wide, so scale it up by 841 mm / 2400 px (= 841 / 635)
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: pdfOut, width: '841mm', height: '1189mm', scale: 841 / (2400 * 25.4 / 96), printBackground: true, pageRanges: '1' });
    console.log('PDF written: ' + pdfOut + ' (A0, 841 × 1189 mm)');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
