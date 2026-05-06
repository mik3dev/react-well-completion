# Profile Panel for `WellDiagram` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional profile panel (pressure / temperature / etc.) rendered alongside the well diagram, sharing the depth axis, controlled entirely via new optional props on the existing `WellDiagram` component.

**Architecture:** Single SVG root. The existing `WellDiagram` measures the container, reserves space for the panel when `profiles` prop is provided, and renders parallel tracks (one per profile) that consume the same `DiagramConfig.depthToPos`. The panel is a tree of new components (`ProfilePanel` → `ProfileTrack` → `ProfileCurve`) plus pure utility functions for sort/filter/scale. Tooltip uses the existing `TooltipProvider`. Backward-compatible: zero changes when `profiles` is absent.

**Tech Stack:** React 19 + TypeScript, Vite library mode, Vitest + Testing Library, jsdom, existing `BrandTheme` and `TooltipProvider` infrastructure.

**Reference spec:** [docs/superpowers/specs/2026-05-06-profile-panel-design.md](../specs/2026-05-06-profile-panel-design.md)

---

## File Structure

**Created files** (all under `packages/react-well-completion/`):

| Path | Responsibility |
|---|---|
| `src/types/profile.ts` | Public types `Profile`, `ProfilePoint`, `ProfileLayout` |
| `src/components/profiles/profile-utils.ts` | Pure helpers: `sortAndFilterPoints`, `buildScale`, `valueToPos`, `getProfileColor`, `formatTooltipValue` |
| `src/components/profiles/ProfileCurve.tsx` | SVG path/circles for one curve given config + scale |
| `src/components/profiles/ProfileTrack.tsx` | Header + value-axis + curve area for one profile |
| `src/components/profiles/ProfilePanel.tsx` | Orchestrates N tracks side-by-side (vertical) or stacked (horizontal) |
| `src/__tests__/profile-utils.test.ts` | Unit tests for pure utilities |
| `src/__tests__/ProfileCurve.test.tsx` | Render tests for the curve component |
| `src/__tests__/ProfileTrack.test.tsx` | Render tests for the track component |
| `src/__tests__/ProfilePanel.test.tsx` | Integration tests: 0/1/N profiles, vertical/horizontal |

**Modified files:**

| Path | Change |
|---|---|
| `src/types/index.ts` | Re-export `Profile`, `ProfilePoint`, `ProfileLayout` |
| `src/index.ts` | Add public exports for the new types |
| `src/components/WellDiagram.tsx` | Reserve panel space; mount `ProfilePanel` inside SVG root |
| `src/__tests__/smoke.test.tsx` | Add test that `WellDiagram` renders with profiles prop |
| `packages/demo-app/src/data/example-wells.ts` | Add `mockProfiles` for visual verification |
| `packages/demo-app/src/App.tsx` | Pass `profiles` prop to `<WellDiagram>` for demo |

---

## Task 1: Public types

**Files:**
- Create: `packages/react-well-completion/src/types/profile.ts`
- Modify: `packages/react-well-completion/src/types/index.ts`
- Modify: `packages/react-well-completion/src/index.ts`

- [ ] **Step 1: Create the types file**

Write `packages/react-well-completion/src/types/profile.ts`:

```ts
/**
 * Single data point in a profile curve.
 */
export interface ProfilePoint {
  /** Depth in feet. Should be within [0, well.totalDepth]. */
  depth: number;
  /** Measured value at this depth, in the unit declared by `Profile.unit`. */
  value: number;
}

/**
 * A profile to render alongside the well diagram (e.g. pressure, temperature).
 *
 * Required: `name`, `unit`, `data`. Optional: `color` (auto-palette fallback),
 * `scale` (forces value-axis range; defaults to data min/max + 5% padding).
 */
export interface Profile {
  id: string;
  name: string;
  unit: string;
  color?: string;
  scale?: {
    min?: number;
    max?: number;
  };
  data: ProfilePoint[];
}

/**
 * Layout strategy for multiple profiles.
 *
 * - `'tracks'` — one parallel track per profile (only mode in v1).
 *
 * Future: `'overlay'` would superimpose curves in a single track.
 */
export type ProfileLayout = 'tracks';
```

- [ ] **Step 2: Re-export from `types/index.ts`**

Add to `packages/react-well-completion/src/types/index.ts`:

```ts
export type * from './well';
export { ALL_LABEL_CATEGORIES, LABEL_CATEGORIES } from './well';
export type { DiagramConfig } from './diagram';
export type { Profile, ProfilePoint, ProfileLayout } from './profile';
```

- [ ] **Step 3: Re-export from the public barrel**

Modify `packages/react-well-completion/src/index.ts`. Find the existing types block:

```ts
export type {
  Well, LiftMethod, DiagramOrientation, HalfSide,
  Casing, TubingSegment, RodSegment, Pump, Packer,
  SeatNipple, Plug, GasAnchor, Mandrel, Sleeve,
  Packing, Perforation, Sand, Wire,
  LabelCategory,
} from './types';
```

Add a new line **right after** that block:

```ts
export type { Profile, ProfilePoint, ProfileLayout } from './types';
```

- [ ] **Step 4: Verify build still passes**

Run: `pnpm --filter @mik3dev/react-well-completion build`
Expected: PASS (no compile errors). The types compile and are emitted in `dist/index.d.ts`.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/types/profile.ts \
        packages/react-well-completion/src/types/index.ts \
        packages/react-well-completion/src/index.ts
git commit -m "feat: add Profile, ProfilePoint, ProfileLayout public types"
```

---

## Task 2: Pure utilities — `sortAndFilterPoints`

**Files:**
- Create: `packages/react-well-completion/src/components/profiles/profile-utils.ts`
- Create: `packages/react-well-completion/src/__tests__/profile-utils.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/react-well-completion/src/__tests__/profile-utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { sortAndFilterPoints } from '../components/profiles/profile-utils';
import type { ProfilePoint } from '../types';

describe('sortAndFilterPoints', () => {
  it('sorts points by depth ascending', () => {
    const input: ProfilePoint[] = [
      { depth: 1000, value: 50 },
      { depth: 200, value: 30 },
      { depth: 600, value: 40 },
    ];
    const result = sortAndFilterPoints(input, 5000);
    expect(result.map(p => p.depth)).toEqual([200, 600, 1000]);
  });

  it('filters points outside [0, totalDepth]', () => {
    const input: ProfilePoint[] = [
      { depth: -10, value: 1 },
      { depth: 100, value: 2 },
      { depth: 5000, value: 3 },
      { depth: 5001, value: 4 },
    ];
    const result = sortAndFilterPoints(input, 5000);
    expect(result.map(p => p.depth)).toEqual([100, 5000]);
  });

  it('does not mutate the input array', () => {
    const input: ProfilePoint[] = [
      { depth: 300, value: 5 },
      { depth: 100, value: 6 },
    ];
    const snapshot = input.map(p => ({ ...p }));
    sortAndFilterPoints(input, 1000);
    expect(input).toEqual(snapshot);
  });

  it('returns empty array when all points are out of range', () => {
    const input: ProfilePoint[] = [
      { depth: -1, value: 1 },
      { depth: 9999, value: 2 },
    ];
    expect(sortAndFilterPoints(input, 1000)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: FAIL with module not found / `sortAndFilterPoints is not defined`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/react-well-completion/src/components/profiles/profile-utils.ts`:

```ts
import type { ProfilePoint } from '../../types';

/**
 * Returns a new array of points sorted by depth ascending and filtered
 * to those inside [0, totalDepth]. Does not mutate input.
 */
export function sortAndFilterPoints(
  points: ProfilePoint[],
  totalDepth: number,
): ProfilePoint[] {
  return [...points]
    .filter(p => p.depth >= 0 && p.depth <= totalDepth)
    .sort((a, b) => a.depth - b.depth);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/components/profiles/profile-utils.ts \
        packages/react-well-completion/src/__tests__/profile-utils.test.ts
git commit -m "feat: add sortAndFilterPoints profile utility"
```

---

## Task 3: Pure utilities — `buildScale`

**Files:**
- Modify: `packages/react-well-completion/src/components/profiles/profile-utils.ts`
- Modify: `packages/react-well-completion/src/__tests__/profile-utils.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `packages/react-well-completion/src/__tests__/profile-utils.test.ts`:

```ts
import { buildScale } from '../components/profiles/profile-utils';

describe('buildScale', () => {
  it('uses data min/max with 5% padding when no override', () => {
    const result = buildScale(
      [
        { depth: 100, value: 1000 },
        { depth: 200, value: 2000 },
      ],
      undefined,
    );
    // range = 1000, padding = 50
    expect(result.min).toBe(950);
    expect(result.max).toBe(2050);
  });

  it('uses scale.min override when provided', () => {
    const result = buildScale(
      [{ depth: 0, value: 100 }, { depth: 1, value: 200 }],
      { min: 0 },
    );
    expect(result.min).toBe(0);
    // max still auto with padding from full range (max - min)
    expect(result.max).toBeCloseTo(205, 5);
  });

  it('uses scale.max override when provided', () => {
    const result = buildScale(
      [{ depth: 0, value: 100 }, { depth: 1, value: 200 }],
      { max: 500 },
    );
    expect(result.max).toBe(500);
    expect(result.min).toBeCloseTo(95, 5);
  });

  it('uses both scale.min and scale.max when provided', () => {
    const result = buildScale(
      [{ depth: 0, value: 100 }, { depth: 1, value: 200 }],
      { min: 0, max: 1000 },
    );
    expect(result).toEqual({ min: 0, max: 1000 });
  });

  it('reorders min/max when scale.min > scale.max', () => {
    const result = buildScale([], { min: 500, max: 100 });
    expect(result).toEqual({ min: 100, max: 500 });
  });

  it('handles single point (min === max in data)', () => {
    const result = buildScale([{ depth: 0, value: 50 }], undefined);
    // range is 0; fallback uses |value| or 1 → padding = 0.05 * 50 = 2.5
    expect(result.min).toBe(47.5);
    expect(result.max).toBe(52.5);
  });

  it('handles all-zero values', () => {
    const result = buildScale(
      [{ depth: 0, value: 0 }, { depth: 1, value: 0 }],
      undefined,
    );
    // range = 0, value = 0, fallback range = 1, padding = 0.05
    expect(result.min).toBe(-0.05);
    expect(result.max).toBe(0.05);
  });

  it('handles empty data with no overrides', () => {
    const result = buildScale([], undefined);
    expect(result.min).toBe(0);
    expect(result.max).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: FAIL with `buildScale is not defined`.

- [ ] **Step 3: Add implementation**

Append to `packages/react-well-completion/src/components/profiles/profile-utils.ts`:

```ts
import type { Profile, ProfilePoint } from '../../types';

const SCALE_PADDING_RATIO = 0.05;

/**
 * Computes the value-axis scale for a profile track.
 *
 * Auto-derives min/max from data with 5% padding. `scaleOverride.min`/`max`
 * take precedence per axis. If `min > max` after overrides, they are reordered.
 * Falls back to [0, 1] when data is empty and no overrides provided.
 */
export function buildScale(
  points: ProfilePoint[],
  scaleOverride: Profile['scale'],
): { min: number; max: number } {
  let min: number;
  let max: number;

  if (points.length === 0) {
    min = scaleOverride?.min ?? 0;
    max = scaleOverride?.max ?? 1;
  } else {
    const dataMin = Math.min(...points.map(p => p.value));
    const dataMax = Math.max(...points.map(p => p.value));
    const rawRange = dataMax - dataMin;
    // When range is 0, fall back to |value| or 1 to keep padding non-zero.
    const effectiveRange = rawRange > 0 ? rawRange : (Math.abs(dataMin) || 1);
    const pad = SCALE_PADDING_RATIO * effectiveRange;

    min = scaleOverride?.min ?? (dataMin - pad);
    max = scaleOverride?.max ?? (dataMax + pad);
  }

  if (min > max) {
    [min, max] = [max, min];
  }
  return { min, max };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: PASS — all 12 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/components/profiles/profile-utils.ts \
        packages/react-well-completion/src/__tests__/profile-utils.test.ts
git commit -m "feat: add buildScale profile utility"
```

---

## Task 4: Pure utilities — `valueToPos` and `getProfileColor`

**Files:**
- Modify: `packages/react-well-completion/src/components/profiles/profile-utils.ts`
- Modify: `packages/react-well-completion/src/__tests__/profile-utils.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `packages/react-well-completion/src/__tests__/profile-utils.test.ts`:

```ts
import {
  valueToPos,
  getProfileColor,
  DEFAULT_PROFILE_COLORS,
} from '../components/profiles/profile-utils';

describe('valueToPos', () => {
  it('maps min to a and max to b', () => {
    expect(valueToPos(0, { min: 0, max: 100 }, 0, 200)).toBe(0);
    expect(valueToPos(100, { min: 0, max: 100 }, 0, 200)).toBe(200);
  });

  it('maps midpoint linearly', () => {
    expect(valueToPos(50, { min: 0, max: 100 }, 0, 200)).toBe(100);
  });

  it('returns midpoint when min === max (degenerate scale)', () => {
    expect(valueToPos(42, { min: 42, max: 42 }, 0, 200)).toBe(100);
    expect(valueToPos(99, { min: 42, max: 42 }, 0, 200)).toBe(100);
  });

  it('supports inverted axis range (a > b)', () => {
    // For horizontal mode where min maps to bottom (high y) and max to top (low y)
    expect(valueToPos(0, { min: 0, max: 100 }, 200, 0)).toBe(200);
    expect(valueToPos(100, { min: 0, max: 100 }, 200, 0)).toBe(0);
    expect(valueToPos(50, { min: 0, max: 100 }, 200, 0)).toBe(100);
  });
});

describe('getProfileColor', () => {
  it('returns explicit color when profile.color is defined', () => {
    expect(getProfileColor({ color: '#abcdef' }, 99)).toBe('#abcdef');
  });

  it('returns palette color when profile.color is undefined', () => {
    expect(getProfileColor({}, 0)).toBe(DEFAULT_PROFILE_COLORS[0]);
    expect(getProfileColor({}, 1)).toBe(DEFAULT_PROFILE_COLORS[1]);
  });

  it('cycles palette after the last color', () => {
    const len = DEFAULT_PROFILE_COLORS.length;
    expect(getProfileColor({}, len)).toBe(DEFAULT_PROFILE_COLORS[0]);
    expect(getProfileColor({}, len + 2)).toBe(DEFAULT_PROFILE_COLORS[2]);
  });

  it('exposes a non-empty palette', () => {
    expect(DEFAULT_PROFILE_COLORS.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: FAIL with `valueToPos is not defined` and `getProfileColor is not defined`.

- [ ] **Step 3: Add implementation**

Append to `packages/react-well-completion/src/components/profiles/profile-utils.ts`:

```ts
/**
 * Default palette used when a profile does not declare an explicit color.
 * Cycles modulo length when more profiles than colors are provided.
 */
export const DEFAULT_PROFILE_COLORS = [
  '#0ea5e9', // sky-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
] as const;

/**
 * Linear mapping from a value to a position along the secondary axis.
 *
 * `[a, b]` is the pixel range for `[min, max]`. When `a > b`, the axis is
 * inverted (used for horizontal mode where min should map to bottom).
 *
 * Degenerate scale (`min === max`) returns `(a + b) / 2`.
 */
export function valueToPos(
  v: number,
  scale: { min: number; max: number },
  a: number,
  b: number,
): number {
  if (scale.min === scale.max) {
    return (a + b) / 2;
  }
  return a + ((v - scale.min) / (scale.max - scale.min)) * (b - a);
}

/**
 * Resolves the color for a profile given its index. Explicit `profile.color`
 * always wins; otherwise the default palette is used (cycling).
 */
export function getProfileColor(
  profile: { color?: string },
  index: number,
): string {
  if (profile.color) return profile.color;
  return DEFAULT_PROFILE_COLORS[index % DEFAULT_PROFILE_COLORS.length];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: PASS — all 21 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/components/profiles/profile-utils.ts \
        packages/react-well-completion/src/__tests__/profile-utils.test.ts
git commit -m "feat: add valueToPos and getProfileColor profile utilities"
```

---

## Task 5: Pure utility — `formatTooltipValue`

**Files:**
- Modify: `packages/react-well-completion/src/components/profiles/profile-utils.ts`
- Modify: `packages/react-well-completion/src/__tests__/profile-utils.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `packages/react-well-completion/src/__tests__/profile-utils.test.ts`:

```ts
import { formatTooltipValue } from '../components/profiles/profile-utils';

describe('formatTooltipValue', () => {
  it('keeps integers integer', () => {
    expect(formatTooltipValue(42)).toBe('42');
    expect(formatTooltipValue(0)).toBe('0');
    expect(formatTooltipValue(-5)).toBe('-5');
  });

  it('rounds fractional values to 2 decimals', () => {
    expect(formatTooltipValue(3.14159)).toBe('3.14');
    expect(formatTooltipValue(0.005)).toBe('0.01');
  });

  it('omits trailing zeros after rounding', () => {
    expect(formatTooltipValue(3.10)).toBe('3.1');
    expect(formatTooltipValue(2.500001)).toBe('2.5');
  });

  it('handles very small floats', () => {
    expect(formatTooltipValue(0.001)).toBe('0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: FAIL with `formatTooltipValue is not defined`.

- [ ] **Step 3: Add implementation**

Append to `packages/react-well-completion/src/components/profiles/profile-utils.ts`:

```ts
/**
 * Formats a numeric value for tooltip display: integers stay integer,
 * fractions are rounded to 2 decimals with trailing zeros stripped.
 */
export function formatTooltipValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  // Round to 2 decimals, then drop trailing zeros via parseFloat.
  return String(parseFloat(v.toFixed(2)));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mik3dev/react-well-completion test -- profile-utils`
Expected: PASS — all 25 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/components/profiles/profile-utils.ts \
        packages/react-well-completion/src/__tests__/profile-utils.test.ts
git commit -m "feat: add formatTooltipValue profile utility"
```

---

## Task 6: `ProfileCurve` component

**Files:**
- Create: `packages/react-well-completion/src/components/profiles/ProfileCurve.tsx`
- Create: `packages/react-well-completion/src/__tests__/ProfileCurve.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `packages/react-well-completion/src/__tests__/ProfileCurve.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProfileCurve from '../components/profiles/ProfileCurve';
import { TooltipProvider } from '../components/Tooltip';

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <TooltipProvider>
      <svg width={200} height={400}>{ui}</svg>
    </TooltipProvider>,
  );

describe('ProfileCurve', () => {
  const baseProps = {
    profile: { id: 'p1', name: 'Pres', unit: 'psi', data: [
      { depth: 100, value: 1000 },
      { depth: 200, value: 2000 },
    ]},
    color: '#0ea5e9',
    depthToPos: (d: number) => d / 10,        // simple linear for tests
    valueRange: { a: 0, b: 100 },
    scale: { min: 0, max: 2000 },
    orientation: 'vertical' as const,
  };

  it('renders a polyline when there are 2+ points', () => {
    const { container } = renderInSvg(<ProfileCurve {...baseProps} />);
    const poly = container.querySelector('polyline');
    expect(poly).not.toBeNull();
    expect(poly?.getAttribute('stroke')).toBe('#0ea5e9');
  });

  it('renders one circle per data point as hover trigger when length >= 2', () => {
    const { container } = renderInSvg(<ProfileCurve {...baseProps} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('renders a single visible circle when data has 1 point', () => {
    const props = {
      ...baseProps,
      profile: { ...baseProps.profile, data: [{ depth: 150, value: 1500 }] },
    };
    const { container } = renderInSvg(<ProfileCurve {...props} />);
    expect(container.querySelector('polyline')).toBeNull();
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
    expect(circles[0].getAttribute('fill')).toBe('#0ea5e9');
  });

  it('renders nothing when data is empty', () => {
    const props = {
      ...baseProps,
      profile: { ...baseProps.profile, data: [] },
    };
    const { container } = renderInSvg(<ProfileCurve {...props} />);
    expect(container.querySelector('polyline')).toBeNull();
    expect(container.querySelector('circle')).toBeNull();
  });

  it('vertical: maps depth to y-axis and value to x-axis', () => {
    const { container } = renderInSvg(<ProfileCurve {...baseProps} />);
    const poly = container.querySelector('polyline');
    // depth=100 → y=10; value=1000 → x = 0 + (1000/2000) * 100 = 50 → "50,10"
    // depth=200 → y=20; value=2000 → x=100 → "100,20"
    expect(poly?.getAttribute('points')).toBe('50,10 100,20');
  });

  it('horizontal: maps depth to x-axis and value to y-axis (inverted)', () => {
    const { container } = renderInSvg(
      <ProfileCurve
        {...baseProps}
        orientation="horizontal"
        valueRange={{ a: 100, b: 0 }} // inverted: low value at bottom (high y)
      />,
    );
    const poly = container.querySelector('polyline');
    // depth=100 → x=10; value=1000 → y = 100 + (1000/2000) * (0 - 100) = 50 → "10,50"
    // depth=200 → x=20; value=2000 → y = 0 → "20,0"
    expect(poly?.getAttribute('points')).toBe('10,50 20,0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- ProfileCurve`
Expected: FAIL with module not found.

- [ ] **Step 3: Write the component**

Create `packages/react-well-completion/src/components/profiles/ProfileCurve.tsx`:

```tsx
import type { Profile } from '../../types';
import { useTooltip } from '../tooltip-context';
import {
  sortAndFilterPoints,
  valueToPos,
  formatTooltipValue,
} from './profile-utils';

interface ProfileCurveProps {
  profile: Profile;
  color: string;
  /** Maps depth (ft) to position along the primary axis (px). */
  depthToPos: (depth: number) => number;
  /** Pixel range [a, b] of the value axis inside the track. */
  valueRange: { a: number; b: number };
  /** Resolved value scale for this profile. */
  scale: { min: number; max: number };
  /** Orientation of the host diagram. */
  orientation: 'vertical' | 'horizontal';
  /** Total well depth, for filtering out-of-range points. */
  totalDepth?: number;
}

const HOVER_RADIUS = 4;
const SINGLE_POINT_RADIUS = 3;

export default function ProfileCurve({
  profile,
  color,
  depthToPos,
  valueRange,
  scale,
  orientation,
  totalDepth,
}: ProfileCurveProps) {
  const tooltip = useTooltip();
  const points = sortAndFilterPoints(
    profile.data,
    totalDepth ?? Number.POSITIVE_INFINITY,
  );

  if (points.length === 0) return null;

  // Each point becomes (primary, secondary) in screen coords.
  // - vertical: depth → y (primary), value → x (secondary)
  // - horizontal: depth → x (primary), value → y (secondary)
  const projected = points.map(p => {
    const primary = depthToPos(p.depth);
    const secondary = valueToPos(p.value, scale, valueRange.a, valueRange.b);
    return orientation === 'vertical'
      ? { x: secondary, y: primary, point: p }
      : { x: primary, y: secondary, point: p };
  });

  const tooltipLines = (depth: number, value: number) => [
    `${profile.name}: ${formatTooltipValue(value)} ${profile.unit}`,
    `@ ${Math.round(depth)} ft`,
  ];

  if (projected.length === 1) {
    const { x, y, point } = projected[0];
    return (
      <circle
        cx={x}
        cy={y}
        r={SINGLE_POINT_RADIUS}
        fill={color}
        onMouseEnter={e => tooltip.show(e, tooltipLines(point.depth, point.value))}
        onMouseMove={e => tooltip.move(e)}
        onMouseLeave={() => tooltip.hide()}
      />
    );
  }

  const polyPoints = projected.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <g>
      <polyline
        points={polyPoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {projected.map((p, i) => (
        <circle
          key={`${profile.id}-${i}`}
          cx={p.x}
          cy={p.y}
          r={HOVER_RADIUS}
          fill="transparent"
          stroke="transparent"
          pointerEvents="all"
          onMouseEnter={e => tooltip.show(e, tooltipLines(p.point.depth, p.point.value))}
          onMouseMove={e => tooltip.move(e)}
          onMouseLeave={() => tooltip.hide()}
        />
      ))}
    </g>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mik3dev/react-well-completion test -- ProfileCurve`
Expected: PASS — 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/components/profiles/ProfileCurve.tsx \
        packages/react-well-completion/src/__tests__/ProfileCurve.test.tsx
git commit -m "feat: add ProfileCurve component (polyline + hover dots)"
```

---

## Task 7: `ProfileTrack` component

**Files:**
- Create: `packages/react-well-completion/src/components/profiles/ProfileTrack.tsx`
- Create: `packages/react-well-completion/src/__tests__/ProfileTrack.test.tsx`

The `ProfileTrack` is the chrome around `ProfileCurve`: header (name + unit), value-axis ticks (min, mid, max), grid lines, and the curve area. It is positioned inside `<ProfilePanel>`'s `<g>` group via parent transforms — the track itself draws in its own local coordinate system starting at `(0, 0)`.

Track local layout (vertical orientation):

```
y=0                          ┌──────────────┐
  HEADER_HEIGHT = 22 px      │  Name unit   │
y=22                         ├──────────────┤
  AXIS_HEIGHT   = 16 px      │ tick tick t  │
y=38                         ├──────────────┤
                             │              │
  curve area (height = H)    │   curve      │
                             │              │
y=38+H                       └──────────────┘
                             ←  W = width  →
```

Track local layout (horizontal orientation): header on the left (writing-mode vertical), axis to the right of header, then curve area filling remaining width.

- [ ] **Step 1: Write the failing tests**

Create `packages/react-well-completion/src/__tests__/ProfileTrack.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProfileTrack from '../components/profiles/ProfileTrack';
import { TooltipProvider } from '../components/Tooltip';

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <TooltipProvider>
      <svg width={500} height={500}>{ui}</svg>
    </TooltipProvider>,
  );

describe('ProfileTrack — vertical', () => {
  const props = {
    profile: { id: 'p1', name: 'Presión', unit: 'psi', data: [
      { depth: 100, value: 1000 },
      { depth: 500, value: 2000 },
    ]},
    color: '#0ea5e9',
    width: 140,
    height: 300,
    depthToPos: (d: number) => d / 10,
    totalDepth: 1000,
    orientation: 'vertical' as const,
  };

  it('renders the header text "Name unit"', () => {
    const { container } = renderInSvg(<ProfileTrack {...props} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Presión');
    expect(text).toContain('psi');
  });

  it('renders 3 axis tick labels (min, mid, max)', () => {
    const { container } = renderInSvg(<ProfileTrack {...props} />);
    // Tick texts are rendered as <text class="profile-tick"> — match by class
    const ticks = container.querySelectorAll('text.profile-tick');
    expect(ticks.length).toBe(3);
  });

  it('renders the polyline (delegates to ProfileCurve)', () => {
    const { container } = renderInSvg(<ProfileTrack {...props} />);
    expect(container.querySelector('polyline')).not.toBeNull();
  });

  it('renders an outer rect with the configured width', () => {
    const { container } = renderInSvg(<ProfileTrack {...props} />);
    const rect = container.querySelector('rect.profile-track-border');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('width')).toBe('140');
  });

  it('renders nothing curve-related when data is empty but keeps header and axis', () => {
    const empty = { ...props, profile: { ...props.profile, data: [] } };
    const { container } = renderInSvg(<ProfileTrack {...empty} />);
    expect(container.querySelector('polyline')).toBeNull();
    expect(container.querySelector('circle')).toBeNull();
    // header still present
    expect(container.textContent).toContain('Presión');
  });
});

describe('ProfileTrack — horizontal', () => {
  const props = {
    profile: { id: 'p1', name: 'Presión', unit: 'psi', data: [
      { depth: 100, value: 1000 },
      { depth: 500, value: 2000 },
    ]},
    color: '#0ea5e9',
    width: 600,                   // in horizontal, width = full diagram width
    height: 140,                  // height = profileTrackWidth
    depthToPos: (d: number) => d / 2,
    totalDepth: 1000,
    orientation: 'horizontal' as const,
  };

  it('renders header text in horizontal mode', () => {
    const { container } = renderInSvg(<ProfileTrack {...props} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Presión');
    expect(text).toContain('psi');
  });

  it('renders polyline in horizontal mode', () => {
    const { container } = renderInSvg(<ProfileTrack {...props} />);
    expect(container.querySelector('polyline')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- ProfileTrack`
Expected: FAIL with module not found.

- [ ] **Step 3: Write the component**

Create `packages/react-well-completion/src/components/profiles/ProfileTrack.tsx`:

```tsx
import type { Profile } from '../../types';
import ProfileCurve from './ProfileCurve';
import {
  sortAndFilterPoints,
  buildScale,
  formatTooltipValue,
} from './profile-utils';

interface ProfileTrackProps {
  profile: Profile;
  color: string;
  /** Width of the track in pixels. In horizontal mode, this is the full diagram width. */
  width: number;
  /** Height of the track in pixels. In horizontal mode, this is profileTrackWidth. */
  height: number;
  /** Maps depth to primary-axis position. */
  depthToPos: (depth: number) => number;
  totalDepth: number;
  orientation: 'vertical' | 'horizontal';
}

const HEADER_THICKNESS = 22;       // px reserved for the title (vertical: top; horizontal: left)
const AXIS_THICKNESS = 16;         // px reserved for tick labels
const HEADER_FONT_SIZE = 11;
const TICK_FONT_SIZE = 9;
const HEADER_FILL = '#52525b';
const TICK_FILL = '#71717a';
const HEADER_BG = '#f4f4f5';
const BORDER_COLOR = '#d4d4d8';
const GRID_COLOR = '#e4e4e7';

export default function ProfileTrack({
  profile,
  color,
  width,
  height,
  depthToPos,
  totalDepth,
  orientation,
}: ProfileTrackProps) {
  const points = sortAndFilterPoints(profile.data, totalDepth);
  const scale = buildScale(points, profile.scale);

  // Compute tick values: min, mid, max (formatted).
  const mid = (scale.min + scale.max) / 2;
  const ticks = [
    { value: scale.min, label: formatTooltipValue(scale.min) },
    { value: mid,       label: formatTooltipValue(mid) },
    { value: scale.max, label: formatTooltipValue(scale.max) },
  ];

  if (orientation === 'vertical') {
    // Layout (local coords starting at 0,0):
    //  - Header band: y in [0, HEADER_THICKNESS]
    //  - Axis band:   y in [HEADER_THICKNESS, HEADER_THICKNESS + AXIS_THICKNESS]
    //  - Curve area:  y in [HEADER_THICKNESS + AXIS_THICKNESS, height]
    const axisTop = HEADER_THICKNESS;
    const curveTop = HEADER_THICKNESS + AXIS_THICKNESS;
    const valueRange = { a: 0, b: width }; // min → left, max → right

    const tickX = (v: number) =>
      width === 0 ? 0 : ((v - scale.min) / (scale.max - scale.min || 1)) * width;

    return (
      <g>
        {/* Outer border */}
        <rect
          className="profile-track-border"
          x={0}
          y={0}
          width={width}
          height={height}
          fill="none"
          stroke={BORDER_COLOR}
          strokeWidth={1}
        />
        {/* Header background */}
        <rect x={0} y={0} width={width} height={HEADER_THICKNESS} fill={HEADER_BG} />
        <line x1={0} y1={HEADER_THICKNESS} x2={width} y2={HEADER_THICKNESS} stroke={BORDER_COLOR} />
        <text
          x={width / 2}
          y={HEADER_THICKNESS / 2 + HEADER_FONT_SIZE / 3}
          fontSize={HEADER_FONT_SIZE}
          fill={HEADER_FILL}
          fontWeight={500}
          textAnchor="middle"
        >
          {profile.name} {profile.unit}
        </text>

        {/* Axis ticks (3 labels: min, mid, max) */}
        {ticks.map((t, i) => {
          const x = i === 0 ? 4 : i === 2 ? width - 4 : tickX(t.value);
          const anchor = i === 0 ? 'start' : i === 2 ? 'end' : 'middle';
          return (
            <text
              key={`tick-${i}`}
              className="profile-tick"
              x={x}
              y={axisTop + AXIS_THICKNESS - 4}
              fontSize={TICK_FONT_SIZE}
              fill={TICK_FILL}
              textAnchor={anchor as 'start' | 'middle' | 'end'}
            >
              {t.label}
            </text>
          );
        })}
        <line x1={0} y1={curveTop} x2={width} y2={curveTop} stroke={BORDER_COLOR} />

        {/* Grid lines (vertical, at each tick) */}
        {ticks.map((t, i) => (
          <line
            key={`grid-${i}`}
            x1={tickX(t.value)}
            y1={curveTop}
            x2={tickX(t.value)}
            y2={height}
            stroke={GRID_COLOR}
            strokeDasharray="2 2"
          />
        ))}

        {/* Curve clipped to its own area via translate */}
        <g transform={`translate(0, 0)`}>
          <ProfileCurve
            profile={profile}
            color={color}
            depthToPos={depthToPos}
            valueRange={valueRange}
            scale={scale}
            orientation="vertical"
            totalDepth={totalDepth}
          />
        </g>
      </g>
    );
  }

  // Horizontal layout: header on left, axis to right of header, then curve area.
  // Total width is split as: HEADER_THICKNESS | AXIS_THICKNESS | curve area.
  const axisLeft = HEADER_THICKNESS;
  const curveLeft = HEADER_THICKNESS + AXIS_THICKNESS;
  const curveAreaWidth = width - curveLeft;
  const valueRange = { a: height, b: 0 }; // inverted: min → bottom (high y), max → top (low y)

  const tickY = (v: number) =>
    height === 0 ? 0 : height - ((v - scale.min) / (scale.max - scale.min || 1)) * height;

  return (
    <g>
      <rect
        className="profile-track-border"
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke={BORDER_COLOR}
        strokeWidth={1}
      />
      {/* Header column on the left (vertical text) */}
      <rect x={0} y={0} width={HEADER_THICKNESS} height={height} fill={HEADER_BG} />
      <line x1={HEADER_THICKNESS} y1={0} x2={HEADER_THICKNESS} y2={height} stroke={BORDER_COLOR} />
      <text
        x={HEADER_THICKNESS / 2 + HEADER_FONT_SIZE / 3}
        y={height / 2}
        fontSize={HEADER_FONT_SIZE}
        fill={HEADER_FILL}
        fontWeight={500}
        textAnchor="middle"
        transform={`rotate(-90, ${HEADER_THICKNESS / 2}, ${height / 2})`}
      >
        {profile.name} {profile.unit}
      </text>

      {/* Axis ticks on the left side of curve area */}
      {ticks.map((t, i) => {
        const y = i === 0 ? height - 4 : i === 2 ? 8 : tickY(t.value);
        return (
          <text
            key={`tick-${i}`}
            className="profile-tick"
            x={curveLeft - 3}
            y={y}
            fontSize={TICK_FONT_SIZE}
            fill={TICK_FILL}
            textAnchor="end"
          >
            {t.label}
          </text>
        );
      })}
      <line x1={curveLeft} y1={0} x2={curveLeft} y2={height} stroke={BORDER_COLOR} />

      {/* Grid lines (horizontal, at each tick) */}
      {ticks.map((t, i) => (
        <line
          key={`grid-${i}`}
          x1={curveLeft}
          y1={tickY(t.value)}
          x2={width}
          y2={tickY(t.value)}
          stroke={GRID_COLOR}
          strokeDasharray="2 2"
        />
      ))}

      {/* Curve area: shift curve so depthToPos(0) maps to curveLeft inside this group. */}
      <g transform={`translate(${curveLeft}, 0)`}>
        <ProfileCurve
          profile={profile}
          color={color}
          depthToPos={depthToPos}
          valueRange={valueRange}
          scale={scale}
          orientation="horizontal"
          totalDepth={totalDepth}
        />
      </g>
      {/* axisLeft is reserved for visual alignment; no rendering needed */}
      <g style={{ display: 'none' }} data-axis-left={axisLeft} data-curve-area-width={curveAreaWidth} />
    </g>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mik3dev/react-well-completion test -- ProfileTrack`
Expected: PASS — 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/components/profiles/ProfileTrack.tsx \
        packages/react-well-completion/src/__tests__/ProfileTrack.test.tsx
git commit -m "feat: add ProfileTrack component (header + axis + curve area)"
```

---

## Task 8: `ProfilePanel` orchestrator

**Files:**
- Create: `packages/react-well-completion/src/components/profiles/ProfilePanel.tsx`
- Create: `packages/react-well-completion/src/__tests__/ProfilePanel.test.tsx`

`ProfilePanel` is the parent that lays out N tracks side-by-side (vertical) or stacked (horizontal). It is rendered by `WellDiagram` inside the same `<svg>` root, positioned via a `<g transform>`.

- [ ] **Step 1: Write the failing tests**

Create `packages/react-well-completion/src/__tests__/ProfilePanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProfilePanel from '../components/profiles/ProfilePanel';
import { TooltipProvider } from '../components/Tooltip';
import type { Profile } from '../types';

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <TooltipProvider>
      <svg width={800} height={600}>{ui}</svg>
    </TooltipProvider>,
  );

const baseProfile: Profile = {
  id: 'p1',
  name: 'Presión',
  unit: 'psi',
  data: [
    { depth: 100, value: 1000 },
    { depth: 500, value: 2000 },
  ],
};

const tempProfile: Profile = {
  id: 't1',
  name: 'Temp',
  unit: '°F',
  data: [
    { depth: 100, value: 80 },
    { depth: 500, value: 120 },
  ],
};

describe('ProfilePanel — vertical', () => {
  const props = {
    profiles: [baseProfile, tempProfile],
    trackWidth: 140,
    panelHeight: 400,
    panelWidth: 280,
    depthToPos: (d: number) => d / 5,
    totalDepth: 1000,
    orientation: 'vertical' as const,
  };

  it('renders one track per profile', () => {
    const { container } = renderInSvg(<ProfilePanel {...props} />);
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks.length).toBe(2);
  });

  it('renders tracks side-by-side at the configured width', () => {
    const { container } = renderInSvg(<ProfilePanel {...props} />);
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks[0].getAttribute('width')).toBe('140');
    expect(tracks[1].getAttribute('width')).toBe('140');
  });

  it('uses palette colors when profile.color is undefined', () => {
    const { container } = renderInSvg(<ProfilePanel {...props} />);
    const polylines = container.querySelectorAll('polyline');
    expect(polylines[0].getAttribute('stroke')).toBe('#0ea5e9');
    expect(polylines[1].getAttribute('stroke')).toBe('#ef4444');
  });

  it('uses explicit color when profile.color is set', () => {
    const profilesWithColor: Profile[] = [
      { ...baseProfile, color: '#123456' },
      tempProfile,
    ];
    const { container } = renderInSvg(
      <ProfilePanel {...props} profiles={profilesWithColor} />,
    );
    const polylines = container.querySelectorAll('polyline');
    expect(polylines[0].getAttribute('stroke')).toBe('#123456');
    expect(polylines[1].getAttribute('stroke')).toBe('#ef4444');
  });
});

describe('ProfilePanel — horizontal', () => {
  it('renders tracks stacked vertically with full width', () => {
    const { container } = renderInSvg(
      <ProfilePanel
        profiles={[baseProfile, tempProfile]}
        trackWidth={140}
        panelHeight={280}
        panelWidth={600}
        depthToPos={(d: number) => d / 2}
        totalDepth={1000}
        orientation="horizontal"
      />,
    );
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks.length).toBe(2);
    expect(tracks[0].getAttribute('width')).toBe('600');
    expect(tracks[0].getAttribute('height')).toBe('140');
  });
});

describe('ProfilePanel — empty', () => {
  it('renders nothing when profiles is empty array', () => {
    const { container } = renderInSvg(
      <ProfilePanel
        profiles={[]}
        trackWidth={140}
        panelHeight={400}
        panelWidth={0}
        depthToPos={(d: number) => d}
        totalDepth={1000}
        orientation="vertical"
      />,
    );
    expect(container.querySelector('rect.profile-track-border')).toBeNull();
    expect(container.querySelector('polyline')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- ProfilePanel`
Expected: FAIL with module not found.

- [ ] **Step 3: Write the component**

Create `packages/react-well-completion/src/components/profiles/ProfilePanel.tsx`:

```tsx
import type { Profile } from '../../types';
import ProfileTrack from './ProfileTrack';
import { getProfileColor } from './profile-utils';

interface ProfilePanelProps {
  profiles: Profile[];
  /** Width per track (vertical) or height per track (horizontal). */
  trackWidth: number;
  /** Total height of the panel area. */
  panelHeight: number;
  /** Total width of the panel area. */
  panelWidth: number;
  depthToPos: (depth: number) => number;
  totalDepth: number;
  orientation: 'vertical' | 'horizontal';
}

export default function ProfilePanel({
  profiles,
  trackWidth,
  panelHeight,
  panelWidth,
  depthToPos,
  totalDepth,
  orientation,
}: ProfilePanelProps) {
  if (profiles.length === 0) return null;

  if (orientation === 'vertical') {
    // Place tracks left-to-right; each track is `trackWidth` px wide and full panel height.
    return (
      <g>
        {profiles.map((p, i) => (
          <g key={p.id} transform={`translate(${i * trackWidth}, 0)`}>
            <ProfileTrack
              profile={p}
              color={getProfileColor(p, i)}
              width={trackWidth}
              height={panelHeight}
              depthToPos={depthToPos}
              totalDepth={totalDepth}
              orientation="vertical"
            />
          </g>
        ))}
      </g>
    );
  }

  // Horizontal: stack tracks top-to-bottom; each is full panel width × trackWidth tall.
  return (
    <g>
      {profiles.map((p, i) => (
        <g key={p.id} transform={`translate(0, ${i * trackWidth})`}>
          <ProfileTrack
            profile={p}
            color={getProfileColor(p, i)}
            width={panelWidth}
            height={trackWidth}
            depthToPos={depthToPos}
            totalDepth={totalDepth}
            orientation="horizontal"
          />
        </g>
      ))}
    </g>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mik3dev/react-well-completion test -- ProfilePanel`
Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/components/profiles/ProfilePanel.tsx \
        packages/react-well-completion/src/__tests__/ProfilePanel.test.tsx
git commit -m "feat: add ProfilePanel orchestrator (parallel tracks layout)"
```

---

## Task 9: Wire `WellDiagram` to render the panel — vertical mode

**Files:**
- Modify: `packages/react-well-completion/src/components/WellDiagram.tsx`
- Modify: `packages/react-well-completion/src/__tests__/smoke.test.tsx`

- [ ] **Step 1: Add a smoke test for the new prop**

Modify `packages/react-well-completion/src/__tests__/smoke.test.tsx`. Add this test inside the `describe('WellDiagram render', () => { ... })` block, after the existing `'renders with casings and perforations'` test:

```tsx
  it('renders with profiles prop without crashing (vertical)', () => {
    const well = {
      ...createWell('Test-Profiles', 'BM'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      casings: [
        createCasing({ diameter: 7, top: 0, base: 5000, isLiner: false }),
      ],
    };
    const profiles = [
      {
        id: 'p1', name: 'Presión', unit: 'psi',
        data: [
          { depth: 100, value: 500 },
          { depth: 2500, value: 1500 },
          { depth: 4900, value: 2400 },
        ],
      },
    ];
    const { container } = render(<WellDiagram well={well} profiles={profiles} />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('renders identically when profiles prop is omitted (regression)', () => {
    const well = createWell('Test-No-Profiles', 'BM');
    const { container: a } = render(<WellDiagram well={well} />);
    const { container: b } = render(<WellDiagram well={well} profiles={[]} />);
    expect(a.querySelector('rect.profile-track-border')).toBeNull();
    expect(b.querySelector('rect.profile-track-border')).toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- smoke`
Expected: FAIL — `WellDiagram` does not yet accept `profiles`. TypeScript compile error or test crash.

- [ ] **Step 3: Modify `WellDiagram.tsx` to accept new props (vertical only for now)**

Edit `packages/react-well-completion/src/components/WellDiagram.tsx`:

**Change 1** — at the top, add the import:

```tsx
import type { Profile, ProfileLayout } from '../types';
import ProfilePanel from './profiles/ProfilePanel';
```

**Change 2** — extend the props interface:

```tsx
export interface WellDiagramProps {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;
  theme?: Partial<BrandTheme>;
  profiles?: Profile[];
  profileLayout?: ProfileLayout;
  profileTrackWidth?: number;
}
```

**Change 3** — destructure and compute panel dimensions. Replace the function signature line:

```tsx
export default function WellDiagram({ well, labels, theme }: WellDiagramProps) {
```

with:

```tsx
const DEFAULT_PROFILE_TRACK_WIDTH = 140;

export default function WellDiagram({
  well,
  labels,
  theme,
  profiles,
  profileLayout: _profileLayout = 'tracks',
  profileTrackWidth = DEFAULT_PROFILE_TRACK_WIDTH,
}: WellDiagramProps) {
  const safeProfiles = profiles ?? [];
  const hasProfiles = safeProfiles.length > 0;
  const panelWidth = hasProfiles ? safeProfiles.length * profileTrackWidth : 0;
```

**Change 4** — adjust `configW` / `configH` to subtract the panel space (vertical only for now):

Replace:

```tsx
  const isH = (well.orientation ?? 'vertical') === 'horizontal';
  // For horizontal: swap dimensions so config generates vertical coords
  // that get rotated by the SVG transform
  // Fixed margins: 45px left for vertical depth axis, 120px bottom for horizontal labels + depth axis
  const configW = isH ? size.height - 100 : size.width - 50;
  const configH = isH ? size.width - 50 : size.height;
  const config = useDiagramConfig(configW, configH, well);
```

with:

```tsx
  const isH = (well.orientation ?? 'vertical') === 'horizontal';
  // For horizontal: swap dimensions so config generates vertical coords
  // that get rotated by the SVG transform
  // Fixed margins: 45px left for vertical depth axis, 120px bottom for horizontal labels + depth axis
  // When profiles are present, reserve panelWidth in vertical mode (panel is to the right).
  const configW = isH
    ? size.height - 100
    : size.width - 50 - panelWidth;
  const configH = isH ? size.width - 50 : size.height;
  const config = useDiagramConfig(configW, configH, well);
```

**Change 5** — render the panel inside the SVG root, positioned to the right of the diagram in vertical mode. Locate the closing `</svg>` tag (around line 159 of the existing file) and insert the new block **immediately before it**:

```tsx
            {/* Profile panel — vertical: positioned to the right of the diagram */}
            {hasProfiles && !isH && config && (
              <g transform={`translate(${size.width - panelWidth}, 0)`}>
                <ProfilePanel
                  profiles={safeProfiles}
                  trackWidth={profileTrackWidth}
                  panelHeight={config.height}
                  panelWidth={panelWidth}
                  depthToPos={config.depthToPos}
                  totalDepth={well.totalDepth}
                  orientation="vertical"
                />
              </g>
            )}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @mik3dev/react-well-completion test -- smoke`
Expected: PASS — both new smoke tests green plus existing ones still green.

Run: `pnpm --filter @mik3dev/react-well-completion test`
Expected: PASS — full suite green.

- [ ] **Step 5: Verify build still works**

Run: `pnpm --filter @mik3dev/react-well-completion build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/react-well-completion/src/components/WellDiagram.tsx \
        packages/react-well-completion/src/__tests__/smoke.test.tsx
git commit -m "feat: render ProfilePanel in WellDiagram (vertical mode)"
```

---

## Task 10: Horizontal-mode panel rendering

**Files:**
- Modify: `packages/react-well-completion/src/components/WellDiagram.tsx`
- Modify: `packages/react-well-completion/src/__tests__/smoke.test.tsx`

- [ ] **Step 1: Add the failing horizontal smoke test**

In `packages/react-well-completion/src/__tests__/smoke.test.tsx`, append to the `WellDiagram render` describe:

```tsx
  it('renders profiles in horizontal orientation without crashing', () => {
    const well = {
      ...createWell('Test-Horizontal', 'BM'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      orientation: 'horizontal' as const,
      casings: [
        createCasing({ diameter: 7, top: 0, base: 5000, isLiner: false }),
      ],
    };
    const profiles = [
      {
        id: 'p1', name: 'Presión', unit: 'psi',
        data: [
          { depth: 100, value: 500 },
          { depth: 4900, value: 2400 },
        ],
      },
    ];
    const { container } = render(<WellDiagram well={well} profiles={profiles} />);
    expect(container.querySelector('div')).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mik3dev/react-well-completion test -- smoke`
Expected: PASS but the panel does NOT render in horizontal (no `polyline` for the profile in the output). The test only checks that it doesn't crash, so it currently passes — but visually there are no profiles in horizontal. Make a stronger check:

Replace the just-added test body's last line with:

```tsx
    expect(container.querySelector('rect.profile-track-border')).not.toBeNull();
```

Re-run: `pnpm --filter @mik3dev/react-well-completion test -- smoke`
Expected: FAIL — no track is rendered in horizontal mode.

- [ ] **Step 3: Update `WellDiagram.tsx` to support horizontal panel**

Edit `packages/react-well-completion/src/components/WellDiagram.tsx`:

**Change 1** — extend the panel-space reservation to also handle horizontal. Replace:

```tsx
  const configW = isH
    ? size.height - 100
    : size.width - 50 - panelWidth;
  const configH = isH ? size.width - 50 : size.height;
```

with:

```tsx
  // panel space reservation:
  //   vertical:   panel goes to the right → subtract panelWidth from horizontal space
  //   horizontal: panel goes below diagram → subtract panelHeight from vertical space
  //
  // In horizontal mode the diagram is rotated, so config dimensions are swapped:
  //   configW = vertical-axis pixels (originally size.height minus chrome)
  //   configH = horizontal-axis pixels (originally size.width minus chrome)
  const panelHeight = hasProfiles && isH ? safeProfiles.length * profileTrackWidth : 0;

  const configW = isH
    ? size.height - 100 - panelHeight
    : size.width - 50 - panelWidth;
  const configH = isH ? size.width - 50 : size.height;
```

**Change 2** — render the horizontal panel block. Add **right after** the vertical panel block from Task 9:

```tsx
            {/* Profile panel — horizontal: positioned below the diagram (above the depth axis) */}
            {hasProfiles && isH && config && (
              <g transform={`translate(45, ${30 + config.width})`}>
                <ProfilePanel
                  profiles={safeProfiles}
                  trackWidth={profileTrackWidth}
                  panelHeight={panelHeight}
                  panelWidth={size.width - 50}
                  depthToPos={(d: number) => {
                    // In horizontal mode the diagram itself is rotated via SVG transform.
                    // For the panel (which is NOT rotated), we map depth directly to X
                    // using the same gamma γ=1.5 as the diagram's depthToPos.
                    if (well.totalDepth === 0) return 0;
                    return Math.pow(d / well.totalDepth, 1.5) * (size.width - 50);
                  }}
                  totalDepth={well.totalDepth}
                  orientation="horizontal"
                />
              </g>
            )}
```

**Change 3** — adjust the horizontal depth-axis Y position so it sits below the panel. Find the existing block:

```tsx
            {/* Horizontal depth axis — rendered outside rotation group at bottom */}
            {isH && config && (() => {
              const axisY = size.height - 20;
```

Replace the `axisY` line with:

```tsx
              const axisY = size.height - 20;
              // Note: when profiles are present in horizontal mode, the panel lives
              // between the diagram and the axis. We keep axisY at the bottom so the
              // depth axis remains the last horizontal element, immediately below the panel.
```

(No functional change — the axis was already at `size.height - 20`, but the comment documents the relationship.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @mik3dev/react-well-completion test -- smoke`
Expected: PASS — horizontal smoke test now finds the track border.

Run: `pnpm --filter @mik3dev/react-well-completion test`
Expected: PASS — full suite green.

- [ ] **Step 5: Verify build still works**

Run: `pnpm --filter @mik3dev/react-well-completion build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/react-well-completion/src/components/WellDiagram.tsx \
        packages/react-well-completion/src/__tests__/smoke.test.tsx
git commit -m "feat: render ProfilePanel in WellDiagram (horizontal mode)"
```

---

## Task 11: Demo-app integration for visual verification

**Files:**
- Modify: `packages/demo-app/src/data/example-wells.ts` (add `mockProfiles` export)
- Modify: `packages/demo-app/src/App.tsx` (pass `profiles` to `<WellDiagram>`)

- [ ] **Step 1: Inspect the current data file**

Run: `head -20 packages/demo-app/src/data/example-wells.ts`
Expected output: shows existing example wells. We add a new export at the bottom; do not modify existing wells.

- [ ] **Step 2: Add mock profiles**

Append to `packages/demo-app/src/data/example-wells.ts`:

```ts
import type { Profile } from '@mik3dev/react-well-completion';

/**
 * Mock profile data for demo / visual verification.
 * Synthesized — not from a real measurement.
 */
export const mockProfiles: Profile[] = [
  {
    id: 'pres-fondo',
    name: 'Presión',
    unit: 'psi',
    data: Array.from({ length: 10 }, (_, i) => {
      const depth = i * 500;          // 0, 500, ..., 4500
      // Linear pressure gradient ~0.45 psi/ft + a small bump near 3000 ft
      const value = 100 + depth * 0.45 + (depth > 2500 && depth < 3500 ? 200 : 0);
      return { depth, value };
    }),
  },
  {
    id: 'temp',
    name: 'Temperatura',
    unit: '°F',
    data: Array.from({ length: 10 }, (_, i) => {
      const depth = i * 500;
      // Geothermal gradient ~1.5 °F per 100 ft, surface 80 °F
      const value = 80 + depth * 0.015;
      return { depth, value };
    }),
  },
];
```

- [ ] **Step 3: Wire profiles into the demo**

Open `packages/demo-app/src/App.tsx`. Find the existing `<WellDiagram ... />` invocation. Add a new state and pass it as a prop. Identify the existing import line for the data:

```ts
import { ... } from './data/example-wells';
```

Add `mockProfiles` to that import. Then locate the `<WellDiagram>` JSX and add the `profiles` prop:

```tsx
<WellDiagram
  well={selectedWell}
  // ... existing props
  profiles={mockProfiles}
/>
```

(If the App already has UI controls to toggle features, use the same pattern. Otherwise hardcoding is fine for demo — this file is owned by the demo, not the lib.)

- [ ] **Step 4: Run the dev server and visually verify**

Run: `pnpm --filter @mik3dev/demo-app dev`
Open the browser at the URL shown (typically `http://localhost:5173`).

Expected:
- Two profile tracks appear to the right of the diagram in vertical mode.
- Headers `Presión psi` and `Temperatura °F` are visible.
- Curves are drawn with sky-blue and red colors respectively.
- Switching to horizontal mode (existing UI) shows the tracks stacked below the diagram.
- Hovering over a curve point shows the tooltip with `Presión: <value> psi @ <depth> ft`.

- [ ] **Step 5: Commit**

```bash
git add packages/demo-app/src/data/example-wells.ts packages/demo-app/src/App.tsx
git commit -m "feat(demo): add mock profiles for visual verification"
```

---

## Task 12: OpenSpec change record

**Files:**
- Create: `openspec/changes/2026-05-06-profile-panel/proposal.md`
- Create: `openspec/changes/2026-05-06-profile-panel/design.md`
- Create: `openspec/changes/2026-05-06-profile-panel/tasks.md`
- Create: `openspec/changes/2026-05-06-profile-panel/specs/profile-panel/spec.md`

- [ ] **Step 1: Create the change directory**

Run:

```bash
mkdir -p openspec/changes/2026-05-06-profile-panel/specs/profile-panel
```

- [ ] **Step 2: Write `proposal.md`**

Create `openspec/changes/2026-05-06-profile-panel/proposal.md`:

```markdown
# Profile Panel for WellDiagram

## ¿Por qué?

`openspec/PLAN-diagram-modes.md` definió cuatro secciones: abstracción de coordenadas, half-section, orientación horizontal, y panel de perfiles. Las primeras tres se cerraron en changes anteriores. La cuarta — el panel de perfiles para visualizar registros tipo presión/temperatura junto al diagrama — quedó pendiente. Este change la cierra.

## ¿Qué cambia?

`WellDiagram` acepta tres props nuevos opcionales: `profiles`, `profileLayout`, `profileTrackWidth`. Cuando hay profiles, se renderiza un panel de tracks paralelos (uno por profile) que comparte el eje de profundidad con el diagrama mecánico. Backward-compatible al 100% — sin esos props, render bit-idéntico al actual.

## Alcance

- API pública: tipos `Profile`, `ProfilePoint`, `ProfileLayout` y los nuevos props en `WellDiagramProps`.
- Layout: tracks paralelos en v1; el prop `profileLayout` está preparado para soportar `'overlay'` en el futuro pero solo `'tracks'` es válido en v1.
- Orientación: el panel sigue al diagrama (vertical → derecha; horizontal → debajo).
- Interactividad: tooltip al hover sobre cada punto. Sin crosshair sincronizado.

## Fuera de alcance

- Editor UI (los profiles vienen 100% por props).
- Modo overlay (deferido a v2).
- Crosshair sincronizado entre diagrama y panel.
- Importación de archivos LAS u otros formatos.
- Downsampling para datasets grandes — recomendamos < 500 puntos por profile.
```

- [ ] **Step 3: Write `design.md` (link to the spec)**

Create `openspec/changes/2026-05-06-profile-panel/design.md`:

```markdown
# Design

El diseño detallado vive en [`docs/superpowers/specs/2026-05-06-profile-panel-design.md`](../../../docs/superpowers/specs/2026-05-06-profile-panel-design.md).

Resumen de decisiones cerradas durante el brainstorming:

1. **Alcance**: extensión del componente `WellDiagram` existente (no se exporta un nuevo componente).
2. **Layout**: tracks paralelos (estándar de well-log software). `profileLayout` extensible para `'overlay'` en v2.
3. **API shape**: `name` y `unit` requeridos; `color` y `scale` opcionales. Paleta automática como fallback.
4. **Orientación**: panel "sigue" al diagrama — vertical→derecha, horizontal→debajo.
5. **Interactividad**: tooltip simple al hover. Sin crosshair sincronizado.
6. **Versionado**: bump minor (0.1.x → 0.2.0). API pública aditiva, no breaking.
```

- [ ] **Step 4: Write `tasks.md`**

Create `openspec/changes/2026-05-06-profile-panel/tasks.md`:

```markdown
# Tasks

- [ ] 1. Tipos públicos `Profile`, `ProfilePoint`, `ProfileLayout` + re-exports
- [ ] 2. `sortAndFilterPoints` (sort + filter sin mutar input)
- [ ] 3. `buildScale` (auto-min/max con padding 5%, overrides, sanitización)
- [ ] 4. `valueToPos` y `getProfileColor` (mapeo lineal + paleta cíclica)
- [ ] 5. `formatTooltipValue` (entero limpio, fracción a 2 decimales)
- [ ] 6. Componente `ProfileCurve` (polyline + hover dots; soporta vertical y horizontal)
- [ ] 7. Componente `ProfileTrack` (header + axis + grid + curva)
- [ ] 8. Componente `ProfilePanel` (orquesta N tracks)
- [ ] 9. Integrar `ProfilePanel` en `WellDiagram` (vertical)
- [ ] 10. Soporte horizontal en `WellDiagram`
- [ ] 11. Datos de ejemplo en demo-app + verificación visual
- [ ] 12. OpenSpec change (este documento)
```

- [ ] **Step 5: Write the requirements spec**

Create `openspec/changes/2026-05-06-profile-panel/specs/profile-panel/spec.md`:

```markdown
## ADDED Requirements

### Requirement: WellDiagram acepta profiles opcionales
`WellDiagram` SHALL aceptar un prop opcional `profiles: Profile[]`. Cuando está ausente o vacío, el render del diagrama SHALL ser bit-idéntico al previo a este change.

#### Scenario: Sin profiles
- **WHEN** el consumidor renderiza `<WellDiagram well={...} />`
- **THEN** el SVG de salida no contiene elementos del panel
- **AND** el ancho/alto del diagrama no se modifica

#### Scenario: Con profiles
- **WHEN** el consumidor renderiza `<WellDiagram well={...} profiles={[p1, p2]} />`
- **THEN** el panel se renderiza con dos tracks
- **AND** el área del diagrama se reduce para acomodar el panel

### Requirement: Tracks paralelos comparten eje de profundidad
Cada track del panel SHALL usar `DiagramConfig.depthToPos` para mapear depth, garantizando alineación pixel-perfect con el eje de profundidad del diagrama.

#### Scenario: Punto a la profundidad d
- **WHEN** un profile tiene un point en `depth = d`
- **THEN** la coordenada primaria del point dentro del track es `depthToPos(d)`
- **AND** coincide con la posición de `d` en el diagrama mecánico

### Requirement: Profile shape mínima
Cada profile SHALL declarar al menos `id`, `name`, `unit`, `data`. `color` y `scale` son opcionales.

#### Scenario: Profile sin color
- **WHEN** `profile.color` es `undefined`
- **THEN** el track usa el color en `DEFAULT_PROFILE_COLORS[index % length]`

#### Scenario: Profile con color
- **WHEN** `profile.color = '#abcdef'`
- **THEN** el track usa exactamente ese color

### Requirement: Escala auto con override
La escala de valor de un track SHALL ser `[dataMin - 5% range, dataMax + 5% range]` por defecto. `profile.scale.min` y `profile.scale.max` cuando están definidos SHALL tomar precedencia.

#### Scenario: scale auto
- **WHEN** profile tiene data `[{value: 100}, {value: 200}]` y `scale` undefined
- **THEN** el eje de valor abarca `[95, 205]`

#### Scenario: scale.min override
- **WHEN** `profile.scale = { min: 0 }` y data `[{value: 100}, {value: 200}]`
- **THEN** el eje de valor parte de 0 y termina en `205` (max sigue auto)

#### Scenario: scale invertido
- **WHEN** `profile.scale = { min: 500, max: 100 }`
- **THEN** el eje se sanitiza a `[100, 500]` (no se invierte la curva)

### Requirement: Orientación del panel sigue al diagrama
Cuando `well.orientation === 'vertical'`, el panel SHALL renderizarse a la derecha del diagrama. Cuando `well.orientation === 'horizontal'`, el panel SHALL renderizarse debajo del diagrama, sobre el eje horizontal de profundidad.

#### Scenario: Vertical
- **WHEN** `well.orientation = 'vertical'` y hay 2 profiles con `profileTrackWidth = 140`
- **THEN** el panel ocupa los últimos 280 px del ancho total
- **AND** el diagrama ocupa los `width - 280 - 50` px restantes

#### Scenario: Horizontal
- **WHEN** `well.orientation = 'horizontal'` y hay 2 profiles con `profileTrackWidth = 140`
- **THEN** los tracks se apilan verticalmente entre el diagrama y el eje de profundidad
- **AND** cada track ocupa todo el ancho disponible

### Requirement: Edge cases en data
El componente SHALL manejar datasets vacíos, single-point, y todos-iguales sin crashear.

#### Scenario: data vacío
- **WHEN** `profile.data = []`
- **THEN** el track muestra header y axis pero ningún `polyline` ni `circle`

#### Scenario: single point
- **WHEN** `profile.data.length === 1`
- **THEN** el track renderiza un único `<circle>` visible (no polyline)

#### Scenario: todos los valores iguales
- **WHEN** todos los `value` son iguales
- **THEN** la curva es una línea recta al centro del eje de valor

### Requirement: Tooltip al hover
Cada point del profile SHALL mostrar un tooltip al `mouseEnter` con formato `{name}: {value} {unit} @ {depth} ft`.

#### Scenario: Hover sobre point
- **WHEN** el mouse entra a la zona de un point con `name='Presión'`, `value=2450`, `unit='psi'`, `depth=1240`
- **THEN** el tooltip muestra `Presión: 2450 psi @ 1240 ft`
```

- [ ] **Step 6: Verify the change is well-formed (manual review)**

Run: `ls openspec/changes/2026-05-06-profile-panel/`
Expected:
```
proposal.md
design.md
tasks.md
specs/profile-panel/spec.md
```

- [ ] **Step 7: Commit**

```bash
git add openspec/changes/2026-05-06-profile-panel/
git commit -m "docs(openspec): add profile-panel change record"
```

---

## Task 13: Final sanity passes

**Files:** none new — this is a verification task.

- [ ] **Step 1: Run the full test suite**

Run: `pnpm --filter @mik3dev/react-well-completion test`
Expected: PASS — all tests green (utils + ProfileCurve + ProfileTrack + ProfilePanel + smoke).

- [ ] **Step 2: Run lint**

Run: `pnpm --filter @mik3dev/react-well-completion lint`
Expected: 0 errors. Fix any warnings introduced by the new files.

- [ ] **Step 3: Run a clean build**

Run: `pnpm --filter @mik3dev/react-well-completion build`
Expected: PASS — emits `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`.

- [ ] **Step 4: Verify public types are exported**

Run:

```bash
grep -E "Profile|ProfilePoint|ProfileLayout" packages/react-well-completion/dist/index.d.ts | head
```

Expected: includes `export type { Profile, ProfilePoint, ProfileLayout }` (or equivalent declaration).

- [ ] **Step 5: Verify backward compatibility**

Run: `pnpm --filter @mik3dev/demo-app dev`
Open the demo. Manually verify:
- (a) The previously-published behavior still works on every example well (regardless of `profiles`).
- (b) Toggling between vertical and horizontal still works with profiles.
- (c) Export PNG/SVG still works and includes the panel.

- [ ] **Step 6: Final commit (if any cleanup needed)**

If lint produced any auto-fix or there's any leftover, commit it:

```bash
git add -A
git commit -m "chore: lint and build verification for profile-panel"
```

If nothing changed, this step is a no-op.

---

## Done

The feature is complete:
- `WellDiagram` accepts `profiles`, `profileLayout`, `profileTrackWidth`.
- Tracks render in both orientations.
- Tooltip shows on hover.
- Tests cover utilities, components, and end-to-end smoke.
- OpenSpec change documented.
- Backward-compatible.
- Demo-app shows the feature.

Release-please should detect the `feat:` commits and propose a `0.2.0` minor bump on the next release PR.
