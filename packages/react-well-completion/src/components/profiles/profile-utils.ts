import type { Profile, ProfilePoint } from '../../types';

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

/**
 * Formats a numeric value for tooltip display: integers stay integer,
 * fractions are rounded to 2 decimals with trailing zeros stripped.
 */
export function formatTooltipValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  // Round to 2 decimals, then drop trailing zeros via parseFloat.
  return String(parseFloat(v.toFixed(2)));
}
