## Context

The casing layer renders rectangular walls with an existing `ShoeIcon` (a small tapered polygon at the bottom) and passes labels to `LabelsLayer`. The shoe icon exists but is not faithful to industry standards. There is no hanger symbol for nested casings, and inline labels on the diagram body are absent. The `Casing` data model lacks `weight` and `grade` fields needed to populate the label.

## Goals / Non-Goals

**Goals:**
- Redesign `ShoeIcon` as a clean outward-pointing filled triangle (no cement circle), matching standard mechanical diagram conventions
- Render an inline label beside each casing body: `Rev. {diameter}" #{weight} {grade} a {base}'` — optional fields omitted gracefully
- Render a `HangerIcon` at the top of any casing where `top > 0`, visually separating the inner casing from the outer in the lap zone
- Add `weight?: number` and `grade?: string` to `Casing` type and editor

**Non-Goals:**
- Multiple hanger types or configurable hanger styles
- Changing the LabelsLayer right-side labels (they remain separate and optional)
- Connector line between casings of different diameters (already exists)

## Decisions

**Shoe shape: single triangle per side, pointing outward/downward**

Left side: triangle with apex at bottom-left (outer edge), base at top of the shoe.
Right side: mirror. The filled dark triangle is the standard industry representation.
Size: `height = WALL * 3`, `width = WALL + 4` (same as existing allocation in CasingLayer).

**Hanger position and appearance**

A hanger is drawn at `y = depthToY(casing.top)` only when `casing.top > 0`.
Shape: a horizontal bar (the "landing shoulder") flanked by two small downward ears — rendered as a polygon. Width spans from inner x1 to outer x1 of the parent casing, but since we don't track parent explicitly, we use `x1 - hangerW` and `x2 + hangerW` where `hangerW = WALL * 1.5`.
The hanger creates a visible gap: the inner casing wall starts `hangerH` pixels below the hanger, and the hanger itself covers the lap zone transition.

**Inline label placement**

Rendered inside `CasingLayer` directly (not LabelsLayer) so it's always visible regardless of label toggles — it's part of the casing graphic itself.
Positioned: left wall outer edge `x1 - WALL/2`, at `y + (h * 0.15)` — near the top of the casing, reading downward.
Font size: 7px, anchored `end` on left side.
Format: `Rev. {d}" #{w} {g} a {base}'` — if `weight` or `grade` absent, those tokens are omitted.

**Data model: additive fields only**

`weight` and `grade` are optional — existing wells with no values render `Rev. 7" a 900'` gracefully.
`createCasing` factory gets `weight: undefined, grade: undefined` defaults.

## Risks / Trade-offs

- [Inline label overlaps casing wall on very narrow casings] → font size 7px is small enough; label is outside the wall (left of x1).
- [Hanger width assumption without parent reference] → using fixed `WALL * 1.5` extension is sufficient for visual indication; exact parent diameter not required.
