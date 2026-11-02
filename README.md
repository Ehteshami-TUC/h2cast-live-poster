# H2CAST live poster – TU Clausthal

Interactive version of the poster "How flexibly can hydrogen salt caverns be cycled?" (TU Clausthal, Chair of
Geomechanics and Multiphysics Systems), shown at the H2CAST Infomarkt, Etzel, 10 November 2026.

Live page: https://ehteshami-tuc.github.io/h2cast-live-poster/

Simulation and laboratory results are preliminary unless stated otherwise. H2CAST-Prove is funded by the German Federal
Ministry for Economic Affairs and Energy (BMWE), funding code 03EI3073C (TU Clausthal).

## Poster source

`poster.jpg` is rendered from `poster/poster.html` (2400 × 3393 px, A0 portrait, TU Clausthal corporate colours:
TUC green RGB 0/140/79, grey 50 %/10 %, TUC red RGB 140/28/0). After editing the poster, run

```bash
node poster/build.cjs
```

It writes `poster.jpg` and `img/ftk_scheme.png`, and updates the clickable areas (`const HOT`) in `index.html` from the
elements marked `data-hot` in the poster. The charts use the data in `index.html` (`T27`, `TB4P`, `YEAR`), so poster and
pop-ups show the same numbers. `node poster/build.cjs --pdf poster.pdf` also writes a vector PDF for printing (scale the
page to A0); `--check` only reports layout problems such as an overflowing column. Requires Playwright with Chromium and
the fonts Caladea, DejaVu Sans and Liberation Sans.
