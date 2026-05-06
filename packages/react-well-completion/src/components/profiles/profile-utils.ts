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
