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
  /** Unique identifier for the profile (used as React key). */
  id: string;
  /** Display name shown in the track header (e.g. "Presión"). */
  name: string;
  /** Unit suffix shown in the track header (e.g. "psi", "°F"). */
  unit: string;
  /** Optional hex color for the curve. Falls back to a cycling palette if omitted. */
  color?: string;
  /** Optional override of the value-axis range. Defaults to data min/max + 5% padding. */
  scale?: {
    /** Optional override for the value axis lower bound. */
    min?: number;
    /** Optional override for the value axis upper bound. */
    max?: number;
  };
  /** Sequence of (depth, value) points. Order is irrelevant; the component sorts internally. */
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
