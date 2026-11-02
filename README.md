# H2CAST live poster – TU Clausthal

Interactive version of the poster "How flexibly can hydrogen salt caverns be cycled?" (TU Clausthal, Chair of
Geomechanics and Multiphysics Systems), shown at the H2CAST Infomarkt, Etzel, 10 November 2026.

Live page: https://ehteshami-tuc.github.io/h2cast-live-poster/

Simulation and laboratory results are preliminary unless stated otherwise. H2CAST-Prove is funded by the German Federal
Ministry for Economic Affairs and Energy (BMWE), funding code 03EI3073C (TU Clausthal).

## Poster source

`poster.jpg` is rendered from `poster/poster.html` (2400 × 3393 px, A0 portrait) in the TU Clausthal corporate colours
(TUC green RGB 0/140/79, grey 50 %/10 %, TUC red RGB 140/28/0). After editing the poster:

```bash
npm install && npx playwright install chromium   # once
npm run poster                                   # poster.jpg, img/ftk_scheme.png, clickable areas in index.html
npm run poster:pdf                               # also poster.pdf for printing: A0 (841 × 1189 mm), vector text
```

`node poster/build.cjs` takes the same options directly: `--pdf out.pdf`, `--check` (layout check only, exit code 1 on
problems), `--preview out.jpg` (render without touching the repo) and `--force` (write despite layout problems; by default
nothing is written if a column overflows, an image is missing or a chart fails). The build also updates the clickable
areas (`const HOT`) from the elements marked `data-hot`, and adds a version tag to `poster.jpg` in `index.html` so browsers
load the new image. The charts use the data in `index.html` (`T27`, `TB4P`, `YEAR`), so poster and pop-ups show the same
numbers. Fonts: Caladea, DejaVu Sans and Liberation Sans.

Logos: TU Clausthal (`img/logo_tuc.svg`), BMWE funding logo (`img/logo_bmwe.svg`) and the partner logos in
`img/partners/` – see `img/partners/SOURCES.md` for where each file comes from.
