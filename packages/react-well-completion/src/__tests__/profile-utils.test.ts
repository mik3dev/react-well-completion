import { describe, it, expect } from 'vitest';
import {
  sortAndFilterPoints,
  buildScale,
  valueToPos,
  getProfileColor,
  DEFAULT_PROFILE_COLORS,
  formatTooltipValue,
} from '../components/profiles/profile-utils';
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
