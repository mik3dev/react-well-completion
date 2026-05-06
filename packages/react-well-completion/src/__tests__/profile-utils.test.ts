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
