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
