## Context

The diagram uses `pulgada = width / 40` to map physical inches to screen pixels. This causes all diameter-based element widths (casings, tubing, pump, accessories) to scale linearly with the SVG container width. On wide viewports the pump and casings become disproportionately large, covering adjacent elements and degrading readability.

## Goals / Non-Goals

**Goals:**
- Cap element widths so the diagram looks consistent regardless of viewport width
- Keep `centerX = width / 2` so the diagram stays horizontally centered and labels benefit from extra space on wide viewports
- Zero changes required in any layer file

**Non-Goals:**
- Responsive breakpoints or CSS-based layout adjustments
- Making the diagram scrollable or zoomable
- Changing how the depth axis or label positioning works

## Decisions

**Use `effectiveWidth = Math.min(width, MAX_DIAGRAM_WIDTH)` for `pulgada` only**

The key insight is that `pulgada` controls element widths but `centerX` controls horizontal placement. Decoupling them lets element sizes stay bounded while the diagram remains centered in any viewport.

Alternative considered: cap `pulgada` directly with a `MAX_PULGADA` constant. Rejected because it's less readable — `MAX_DIAGRAM_WIDTH = 480` is self-documenting (matches a reference viewport width), whereas `MAX_PULGADA = 12` requires mental math to understand.

**`MAX_DIAGRAM_WIDTH = 480`**

At 480px effective width, `pulgada = 480/40 = 12 px/inch`. A 7" casing renders at 84px wide — visually proportional and not oversized. This value can be tuned without touching any other file.

## Risks / Trade-offs

- [Very narrow viewports < 480px] → elements still shrink proportionally, no worse than before.
- [Constant needs tuning] → isolated to a single `const` in `use-diagram-config.ts`.

## Migration Plan

Single-file change. No state migration, no breaking API change, instant rollback by reverting the constant.
