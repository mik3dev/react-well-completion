## Why

The casing layer currently shows a minimal shoe icon and no technical metadata, making diagrams look generic and hard to read professionally. Engineers need to see the shoe symbol, casing specs (weight, grade), and hanger symbol for liners — all standard in oil & gas mechanical diagrams.

## What Changes

- Add `weight` (lb/ft) and `grade` (steel grade string) optional fields to the `Casing` data model
- Update `WellEditor` to expose these new fields in the casings table
- Redesign the `ShoeIcon` into a proper tapered triangular shoe (filled triangle pointing outward on each side)
- Add an inline label directly on the casing body: `Rev. {diameter}" #{weight} {grade} a {base}'`
- Add a `HangerIcon` drawn at the top of any casing with `top > 0`, showing a bracket/flange symbol that visually separates the inner casing from the outer casing in the lap zone

## Capabilities

### New Capabilities

- `casing-shoe`: Triangular shoe symbol at the base of each casing, replacing the current minimal icon
- `casing-hanger`: Hanger/colgador symbol at the top of nested casings (liners and lap strings), with visual separation in the overlap zone
- `casing-inline-label`: Technical label printed alongside each casing body with diameter, weight, grade, and depth

### Modified Capabilities

- (none — data model addition is additive with no breaking changes to existing behavior)

## Impact

- `src/types/well.ts` — add `weight?: number` and `grade?: string` to `Casing`
- `src/utils/well-factory.ts` — update `createCasing` factory
- `src/components/editor/WellEditor.tsx` — add weight/grade columns to casing table
- `src/components/diagram/icons.tsx` — redesign `ShoeIcon`, add `HangerIcon`
- `src/components/diagram/layers/CasingLayer.tsx` — render inline label, hanger, new shoe
- `src/components/diagram/layers/LabelsLayer.tsx` — update casing label to include weight/grade
