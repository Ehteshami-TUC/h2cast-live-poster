# H2CAST live poster – TU Clausthal

Interactive version of the poster "Flexible hydrogen storage in salt caverns – stable and tight?" (TU Clausthal, Chair of
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

Without Node.js or the fonts on your own computer: push a branch. The workflow `.github/workflows/render-poster.yml`
renders the poster in the cloud with the right fonts, commits `poster.jpg`, the clickable areas and new figure copies to
that branch, and provides the A0 print PDF as a download (Actions → the run → Artifacts → `poster-A0-print`). It runs
for pushes to a branch other than main that change `poster/`, the figure SVGs, `img/` or `package.json`, or by hand
(Actions tab; on main it only renders and uploads, it never commits). It adds a commit to your branch, so run `git pull`
before you push again.

`node poster/build.cjs` takes the same options directly: `--pdf out.pdf`, `--check` (layout check only, exit code 1 on
problems), `--preview out.jpg` (render without touching the repo) and `--force` (write despite layout problems; by default
nothing is written if a column overflows, an image is missing or a chart fails). The build also updates the clickable
areas (`const HOT`) from the elements marked `data-hot`, and adds a version tag to `poster.jpg` in `index.html` so browsers
load the new image. Fonts: Caladea, DejaVu Sans and Liberation Sans.

Logos: TU Clausthal (`img/logo_tuc.svg`), BMWE funding logo (`img/logo_bmwe.svg`) and the partner logos in
`img/partners/` – see `img/partners/SOURCES.md` for where each file comes from.

Fig. 4, Fig. 6a and Fig. 7 are the figure files in `poster_figures_2026-11/` (November 2026; SVG, PNG and PDF at their
printed size, see the README there). `poster/poster.html` shows the SVGs; to change a figure, replace its file and run
`npm run poster`. The pop-ups of the live page use the same data: `T27` (test No. 27), and `TB4P` and `YEAR` (variant V1),
which were read from the SVG curves of Fig. 6a and Fig. 7 (YEAR: the first days of η from the FTK history data, because
Fig. 7 cuts the initial transient off).
