# Poster figures – update November 2026

New and corrected figures for the poster "Flexible hydrogen storage in salt caverns – stable and tight?". Each figure is drawn at
the size it has on the A0 poster (same width as the chart it replaces), with the poster colours (K358 blue, K365
magenta) and fonts of about 20 pt. Every figure comes in three formats:

- **PNG**, 300 dpi, for PowerPoint, Word or image editors
- **SVG**, text stays editable
- **PDF**, vector, fonts embedded, for print

| File | Use on the poster | Printed size |
|---|---|---|
| `fig4_test27` | Fig. 4, lab test No. 27 | 350 × 167 mm |
| `fig6a_tb4_pressure` | Fig. 6a, gas pressures in the TB4 overflow test | 172 × 104 mm |
| `fig7_storage_year_V1` | Fig. 7, one storage year | 350 × 154 mm |
| `fig7_storage_year_V1_zones858_7323` | Fig. 7, alternative (see below) | 350 × 154 mm |

Simulation and laboratory results are preliminary.

## What changed

**Fig. 4 – test No. 27**
- The gas axis says "uncalibrated", because the outlet-pump volume is not yet calibrated.
- New wording: "no measurable gas passage up to 19.5 MPa" and "helium at the outlet at 20.2 MPa".
- The stress lines σ₁ and σ₃ are now light grey, so colour-blind readers can tell them apart from the green helium
  curve.

**Fig. 6a – TB4**
- The time axis now shows the phase times of the model run:
  - 15 h brine into K358;
  - 9 h standstill;
  - 4 h H₂ overflow (3 h fast, 1 h slow).
- The curves were read off the FTK result plots. In the old version the overflow started about 2 h too late.
- The pressures are unchanged. The y axis now says that they are wellhead pressures.

**Fig. 7 – one storage year**
- The figure now shows the variant without brine movement (V1). Here the gas is moved between the two caverns, not the
  brine. It replaces the earlier variant with brine movement.
- Top panel: gas pressure in both caverns, with the permitted range of 5–17 MPa.
  - Below 5 MPa the stability of the cavern is at risk; above 17 MPa its tightness.
  - K358 moves between 5.5 and 16.0 MPa, K365 between 5.5 and 16.95 MPa.
- Bottom panel: dilatancy utilisation factor η. In operation η stays below 1, and there is no tension at the wall.
  - Above 1 only in the first days of the run. This is the initial transient of the model: pressure and temperature are
    set at the start.
- The two Fig. 7 files differ only in which zones η is taken from:
  - `fig7_storage_year_V1`: η is the highest value of all observed zones at the wall of each cavern, which is the safe
    side. K358 max 0.92 (March), K365 max 0.84 (October).
  - `fig7_storage_year_V1_zones858_7323`: η comes from one reference zone per cavern, as on the AP 1.10 status slides.
    K358 max 0.70, K365 max 0.84.

## Suggested captions

- **Fig. 4:** Test No. 27, cement specimen (Ø 88 × 180 mm, 30 °C), helium instead of hydrogen for safety.
  - (a) Full test, (b) last 30 hours.
  - Gas at the outlet: outlet-pump volume, not yet calibrated.
- **Fig. 6a:** Gas pressures at the wellhead (FTK).
  - Brine raises the pressure in K358 (15 h).
  - After a 9 h standstill, H₂ flows over to K365 without a compressor (4 h).
- **Fig. 7:** FTK, one storage year without brine movement (variant V1, AP 1.10).
  - Input: DLR hydrogen storage profile 2045, scaled to the two caverns.
  - The gas pressures use the permitted range of 5–17 MPa.
  - η = highest utilisation of the observed zones at the cavern wall.

## Text corrections (2 November 2026)

The SVGs were edited so that the poster and the live-page pop-ups use the same terms; the PNG and PDF versions were
regenerated from the edited SVGs with `node poster/export_figures.cjs` (fonts: Liberation Sans and Caladea, the
metric-compatible equivalents of Arial and Cambria).

- `fig4_test27`: y axis "Stress, gas pressure [MPa]" (two lines; was "Stress, pressure [MPa]").
- `fig7_storage_year_V1` and `fig7_storage_year_V1_zones858_7323`: y axis of the lower panel "Dilatancy utilisation
  factor η [–]" (three lines); "initial transient of the model" instead of "start reaction of the model".

## Text correction (3 November 2026)

- `fig4_test27`: the label at 20.2 MPa now reads "helium at the outlet at 20.2 MPa", because the flow path of the
  helium is not known.

If the figures are generated again from their script, use these labels there as well.
