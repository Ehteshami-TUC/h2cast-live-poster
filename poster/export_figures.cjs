#!/usr/bin/env node
// Regenerates the PNG (300 dpi) and PDF versions of the SVG figures in poster_figures_2026-11/ from the SVGs,
// so that the three formats stay identical after the SVG text has been edited.
//
//   node poster/export_figures.cjs                 all SVGs in poster_figures_2026-11/
//   node poster/export_figures.cjs fig4_test27     only this figure
//
// Fonts: the SVGs name Arial and Cambria; without them Chromium uses the metric-compatible Liberation Sans and Caladea.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = path.resolve(__dirname, '..', 'poster_figures_2026-11');
const only = process.argv.slice(2);

// Writes the resolution (pHYs chunk) into a PNG, so programs like PowerPoint place it at its printed size.
function setPngDpi(file, dpi) {
  const zlib = require('zlib');
  let png = fs.readFileSync(file);
  const chunks = [];
  for (let o = 8; o < png.length;) {                              // drop an existing pHYs chunk
    const len = png.readUInt32BE(o), type = png.toString('ascii', o + 4, o + 8);
    if (type !== 'pHYs') chunks.push(png.subarray(o, o + 12 + len));
    o += 12 + len;
  }
  const data = Buffer.alloc(9);
  const ppm = Math.round(dpi / 0.0254);
  data.writeUInt32BE(ppm, 0); data.writeUInt32BE(ppm, 4); data[8] = 1;   // unit: metre
  const typeAndData = Buffer.concat([Buffer.from('pHYs', 'ascii'), data]);
  const chunk = Buffer.alloc(12 + 9);
  chunk.writeUInt32BE(9, 0); typeAndData.copy(chunk, 4); chunk.writeUInt32BE(zlib.crc32(typeAndData) >>> 0, 4 + typeAndData.length);
  png = Buffer.concat([png.subarray(0, 8), chunks[0], chunk, ...chunks.slice(1)]);  // right after IHDR
  fs.writeFileSync(file, png);
}

(async () => {
  const names = fs.readdirSync(DIR).filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4))
    .filter(n => !only.length || only.includes(n));
  const browser = await chromium.launch();
  for (const name of names) {
    const svgFile = path.join(DIR, name + '.svg');
    const svg = fs.readFileSync(svgFile, 'utf8');
    const w = parseFloat(svg.match(/<svg[^>]*\swidth="([\d.]+)pt"/)[1]);
    const h = parseFloat(svg.match(/<svg[^>]*\sheight="([\d.]+)pt"/)[1]);
    const cssW = w * 96 / 72, cssH = h * 96 / 72;                     // 1 pt = 1/72 in, 1 CSS px = 1/96 in
    const html = `<!doctype html><html><head><style>@page{margin:0}html,body{margin:0}img{display:block;width:${cssW}px;height:${cssH}px}</style></head>`
               + `<body><img src="${path.basename(svgFile)}"></body></html>`;
    const tmp = path.join(DIR, `.${name}.export.html`);
    fs.writeFileSync(tmp, html);
    try {
      // PNG at 300 dpi
      const page = await browser.newPage({ viewport: { width: Math.ceil(cssW), height: Math.ceil(cssH) }, deviceScaleFactor: 300 / 96 });
      await page.goto('file://' + tmp);
      await page.evaluate(async () => { await document.fonts.ready; const i = document.images[0]; if (!i.complete) await new Promise(r => { i.onload = r; }); });
      await page.locator('img').screenshot({ path: path.join(DIR, name + '.png'), omitBackground: false });
      setPngDpi(path.join(DIR, name + '.png'), 300);
      // PDF at the printed size, vector
      await page.pdf({ path: path.join(DIR, name + '.pdf'), width: `${w / 72}in`, height: `${h / 72}in`, printBackground: true, pageRanges: '1' });
      await page.close();
      console.log(`${name}: png (300 dpi) and pdf (${(w / 72 * 25.4).toFixed(0)} × ${(h / 72 * 25.4).toFixed(0)} mm) written`);
    } finally {
      fs.unlinkSync(tmp);
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
