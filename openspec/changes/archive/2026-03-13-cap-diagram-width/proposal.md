## Why

When the diagram viewport is wide (e.g., full-screen on large monitors), `pulgada = width / 40` causes all diameter-based elements (casings, tubing, pump, accessories) to scale up proportionally, making the pump and other components oversized and covering adjacent elements. A fixed maximum effective width ensures consistent, readable proportions regardless of viewport size.

## What Changes

- Add a `MAX_DIAGRAM_WIDTH` constant (480 px) in `use-diagram-config.ts`
- Compute `effectiveWidth = Math.min(width, MAX_DIAGRAM_WIDTH)` and use it only for `pulgada` calculation
- `centerX` remains `width / 2` so the diagram stays centered and labels benefit from the extra horizontal space on wide viewports

## Capabilities

### New Capabilities

- `diagram-width-cap`: Limits the effective width used for diameter-to-pixel scaling so diagram elements have a maximum visual size independent of viewport width

### Modified Capabilities

- (none — this is a pure implementation change with no spec-level behavior changes)

## Impact

- `src/hooks/use-diagram-config.ts`: 3-line change
- All 11 SVG layer files: no changes needed (they consume `config.pulgada` which will now be capped)
