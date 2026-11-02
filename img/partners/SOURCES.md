# Logo files

| File | Logo | Source of this copy |
|---|---|---|
| `../logo_tuc.svg` | TU Clausthal logo: vector mark and wordmark (`Logo_TUC_de_rgb.SVG`), with the line “Clausthal University of Technology” from the earlier raster logo | github.com/gbv/reposis_clausthal (TU Clausthal library) |
| `../logo_bmwe.svg` | BMWE funding logo "Gefördert durch … aufgrund eines Beschlusses des Deutschen Bundestages" (2025 version, `BMWE_gefoerdert_de_RGB.svg`, viewBox cropped to the artwork) | github.com/TUB-DVG/wissen-digital-ewb |
| `dlr.svg` | DLR – Deutsches Zentrum für Luft- und Raumfahrt | github.com/eclipse-sumo/sumo.website |
| `gasunie.svg` | Gasunie, with “crossing borders in energy” | github.com/raivo-otp/issuer-icons |
| `storag_etzel.png` | STORAG ETZEL – Energy Storage Solutions | cut from the logo sheet supplied by the authors (412 × 78 px) |
| `deep_kbb.png` | DEEP.KBB | cut from the logo sheet supplied by the authors (289 × 64 px) |

The vector copies were taken from public repositories because the partners' own websites were not reachable from the
build environment; STORAG ETZEL and DEEP.KBB are small raster images. For a sharp print, replace them with the official
files (an `.svg` with the same name takes precedence over the `.png`), then run `node poster/build.cjs`. A partner without
any file is shown as plain text.
