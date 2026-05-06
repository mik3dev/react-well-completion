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
