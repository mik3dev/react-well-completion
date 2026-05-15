import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  WellDiagram,
  SimplifiedDiagram,
  createWell,
  createCasing,
  createPerforation,
  LABEL_CATEGORIES,
  ALL_LABEL_CATEGORIES,
  defaultTheme,
} from '../index';

// jsdom doesn't support ResizeObserver
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

/**
 * In jsdom, `getBoundingClientRect` returns zeros by default, so WellDiagram's
 * `useDiagramConfig` returns null (precondition: width/height > 0) and no SVG
 * renders. For tests that need to assert on panel layout, temporarily patch
 * the prototype to return non-zero dimensions.
 */
function withFakeContainerSize<T>(width: number, height: number, fn: () => T): T {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    return {
      width, height, top: 0, left: 0,
      bottom: height, right: width, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  };
  try {
    return fn();
  } finally {
    Element.prototype.getBoundingClientRect = original;
  }
}

describe('Library exports', () => {
  it('exports WellDiagram component', () => {
    expect(WellDiagram).toBeDefined();
    expect(typeof WellDiagram).toBe('function');
  });

  it('exports SimplifiedDiagram component', () => {
    expect(SimplifiedDiagram).toBeDefined();
    expect(typeof SimplifiedDiagram).toBe('function');
  });

  it('exports LABEL_CATEGORIES with all entries', () => {
    expect(LABEL_CATEGORIES).toBeDefined();
    expect(LABEL_CATEGORIES.length).toBe(ALL_LABEL_CATEGORIES.length);
    for (const cat of LABEL_CATEGORIES) {
      expect(cat).toHaveProperty('key');
      expect(cat).toHaveProperty('label');
    }
  });

  it('exports defaultTheme with required colors', () => {
    expect(defaultTheme).toHaveProperty('headerBg');
    expect(defaultTheme).toHaveProperty('accent');
    expect(defaultTheme).toHaveProperty('headerText');
  });
});

describe('createWell factory', () => {
  it('creates a well with correct defaults', () => {
    const well = createWell('Pozo-001', 'BM');

    expect(well.id).toBeDefined();
    expect(well.id.length).toBeGreaterThan(0);
    expect(well.name).toBe('Pozo-001');
    expect(well.liftMethod).toBe('BM');
    expect(well.casings).toEqual([]);
    expect(well.tubingString).toEqual([]);
    expect(well.rodString).toEqual([]);
    expect(well.pump).toBeNull();
    expect(well.mandrels).toEqual([]);
    expect(well.wire).toBeNull();
  });

  it('creates wells with unique IDs', () => {
    const well1 = createWell('A', 'GL');
    const well2 = createWell('B', 'GL');

    expect(well1.id).not.toBe(well2.id);
  });
});

describe('WellDiagram render', () => {
  it('renders without crashing with minimal well data', () => {
    const well = createWell('Test', 'BM');

    const { container } = render(<WellDiagram well={well} />);

    expect(container).toBeDefined();
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('renders with casings and perforations', () => {
    const well = {
      ...createWell('Test-Full', 'BM'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      casings: [
        createCasing({ diameter: 9.625, top: 0, base: 3000, isLiner: false }),
        createCasing({ diameter: 7, top: 0, base: 5000, isLiner: false }),
      ],
      perforations: [
        createPerforation({ top: 4600, base: 4700, type: 'shoot' }),
      ],
    };

    const { container } = render(<WellDiagram well={well} />);

    expect(container.querySelector('div')).not.toBeNull();
  });

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
    expect(container.querySelector('rect.profile-track-border')).not.toBeNull();
  });

  it('renders profiles in half-section vertical mode without crashing (halfSide=right)', () => {
    const well = {
      ...createWell('Test-HS-Right', 'GL'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      halfSection: true,
      halfSide: 'right' as const,
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
    const { container } = withFakeContainerSize(800, 600, () =>
      render(<WellDiagram well={well} profiles={profiles} />),
    );
    expect(container.querySelector('rect.profile-track-border')).not.toBeNull();
  });

  it('expands the panel to fill the freed half (halfSide=left)', () => {
    // Container width = 800. Chrome = 50. Half-available = (800 - 50) / 2 = 375.
    // 2 tracks, default profileTrackWidth=140 → tracks grow to 375/2 = 187.5 each
    // (since 187.5 > 140, the minimum is satisfied).
    const well = {
      ...createWell('Test-HS-Left', 'GL'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      halfSection: true,
      halfSide: 'left' as const,
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
      {
        id: 't1', name: 'Temperatura', unit: '°F',
        data: [
          { depth: 100, value: 80 },
          { depth: 4900, value: 145 },
        ],
      },
    ];
    const { container } = withFakeContainerSize(800, 600, () =>
      render(<WellDiagram well={well} profiles={profiles} />),
    );
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks.length).toBe(2);
    const trackWidth = parseFloat(tracks[0].getAttribute('width') ?? '0');
    // Each track should be > the default 140 (it grew to fill the half).
    expect(trackWidth).toBeGreaterThan(140);
    // And ≤ the half-available width per track (no overflow when min is small).
    expect(trackWidth).toBeLessThanOrEqual(375 / 2 + 0.01);
  });

  it('expands the panel to fill the freed half in horizontal + half-section', () => {
    // Container 1000x800 horizontal.
    // Vertical chrome = 100; halfAvailableH = (800 - 100) / 2 = 350.
    // 2 tracks, default profileTrackWidth=140 → tracks grow to 350/2 = 175 each.
    const well = {
      ...createWell('Test-Hor-HS', 'GL'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      orientation: 'horizontal' as const,
      halfSection: true,
      halfSide: 'left' as const,
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
      {
        id: 't1', name: 'Temperatura', unit: '°F',
        data: [
          { depth: 100, value: 80 },
          { depth: 4900, value: 145 },
        ],
      },
    ];
    const { container } = withFakeContainerSize(1000, 800, () =>
      render(<WellDiagram well={well} profiles={profiles} />),
    );
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks.length).toBe(2);
    // In horizontal, each track's "height" (rect.height attribute) is the per-track
    // dimension that grew. Width is the full diagram width (size.width - 50 = 950).
    const trackHeight = parseFloat(tracks[0].getAttribute('height') ?? '0');
    expect(trackHeight).toBeGreaterThan(140);
    expect(trackHeight).toBeLessThanOrEqual(350 / 2 + 0.01);
  });

  it('SimplifiedDiagram renders with profiles in vertical', () => {
    const well = {
      ...createWell('Test-Simp-V', 'BM'),
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
          { depth: 4900, value: 2400 },
        ],
      },
    ];
    const { container } = withFakeContainerSize(800, 600, () =>
      render(<SimplifiedDiagram well={well} profiles={profiles} />),
    );
    expect(container.querySelector('rect.profile-track-border')).not.toBeNull();
  });

  it('SimplifiedDiagram renders with profiles in horizontal', () => {
    const well = {
      ...createWell('Test-Simp-H', 'BM'),
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
      {
        id: 't1', name: 'Temperatura', unit: '°F',
        data: [
          { depth: 100, value: 80 },
          { depth: 4900, value: 145 },
        ],
      },
    ];
    const { container } = withFakeContainerSize(1000, 800, () =>
      render(<SimplifiedDiagram well={well} profiles={profiles} />),
    );
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks.length).toBe(2);
  });

  it('SimplifiedDiagram renders identically when profiles prop is omitted (regression)', () => {
    const well = createWell('Test-Simp-No-Profiles', 'BM');
    const { container: a } = render(<SimplifiedDiagram well={well} />);
    const { container: b } = render(<SimplifiedDiagram well={well} profiles={[]} />);
    expect(a.querySelector('rect.profile-track-border')).toBeNull();
    expect(b.querySelector('rect.profile-track-border')).toBeNull();
  });

  it('horizontal + half-section + halfSide=right does not crash', () => {
    const well = {
      ...createWell('Test-Hor-HS-R', 'GL'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      orientation: 'horizontal' as const,
      halfSection: true,
      halfSide: 'right' as const,
      casings: [
        createCasing({ diameter: 7, top: 0, base: 5000, isLiner: false }),
      ],
    };
    const profiles = [
      {
        id: 'p1', name: 'Presión', unit: 'psi',
        data: [{ depth: 100, value: 500 }, { depth: 4900, value: 2400 }],
      },
    ];
    const { container } = withFakeContainerSize(1000, 800, () =>
      render(<WellDiagram well={well} profiles={profiles} />),
    );
    expect(container.querySelector('rect.profile-track-border')).not.toBeNull();
  });
});

describe('EarthLayer non-liner shoe criterion', () => {
  // Synthetic well that mirrors VLG3873: surface casing, intermediate casing,
  // and a deeper production liner. EarthLayer should render from the deepest
  // non-liner shoe (intermediate base = 14650) to totalDepth, NOT from HUD.
  const buildWell = (overrides: { halfSection?: boolean; halfSide?: 'left' | 'right' } = {}) => ({
    ...createWell('Test-Earth', 'GL'),
    totalDepth: 16377,
    totalFreeDepth: 16233,
    casings: [
      createCasing({ diameter: 13.375, top: 0, base: 4000, isLiner: false }),
      createCasing({ diameter: 9.625,  top: 0, base: 14650, isLiner: false }),
      createCasing({ diameter: 7,      top: 14132, base: 16372, isLiner: true }),
    ],
    perforations: [
      createPerforation({ top: 15774, base: 15780, type: 'shoot' as const }),
    ],
    ...overrides,
  });

  it('renders earth rects from deepest non-liner shoe to totalDepth', () => {
    const { container } = withFakeContainerSize(800, 1200, () =>
      render(<WellDiagram well={buildWell()} />),
    );
    const earthLayer = container.querySelector('g.layer-earth');
    expect(earthLayer).not.toBeNull();
    const rects = earthLayer?.querySelectorAll('rect') ?? [];
    expect(rects.length).toBeGreaterThan(0);
  });

  it('does not render earth when there are no non-liner casings', () => {
    const wellOnlyLiner = {
      ...createWell('Test-Only-Liner', 'GL'),
      totalDepth: 16377,
      totalFreeDepth: 16233,
      casings: [
        createCasing({ diameter: 7, top: 14132, base: 16372, isLiner: true }),
      ],
    };
    const { container } = withFakeContainerSize(800, 1200, () =>
      render(<WellDiagram well={wellOnlyLiner} />),
    );
    const earthLayer = container.querySelector('g.layer-earth');
    // The <g class="layer-earth"> may or may not be rendered depending on the
    // null short-circuit in React. What matters is there are no earth rects.
    const rects = earthLayer?.querySelectorAll('rect') ?? [];
    expect(rects.length).toBe(0);
  });

  it('uses the default earthFill pattern when theme.earthFill is not overridden', () => {
    const { container } = withFakeContainerSize(800, 1200, () =>
      render(<WellDiagram well={buildWell()} />),
    );
    const rect = container.querySelector('g.layer-earth rect');
    expect(rect?.getAttribute('fill')).toBe('url(#earthFill)');
  });

  it('respects custom theme.earthFill on WellDiagram', () => {
    const { container } = withFakeContainerSize(800, 1200, () =>
      render(<WellDiagram well={buildWell()} theme={{ earthFill: '#abcdef' }} />),
    );
    const rect = container.querySelector('g.layer-earth rect');
    expect(rect?.getAttribute('fill')).toBe('#abcdef');
  });

  it('SimplifiedDiagram defaults earthFill to transparent', () => {
    const { container } = withFakeContainerSize(800, 1200, () =>
      render(<SimplifiedDiagram well={buildWell()} />),
    );
    const rect = container.querySelector('g.layer-earth rect');
    // SimplifiedDiagram still renders the rects (so consumer can override),
    // but the default fill is transparent.
    expect(rect?.getAttribute('fill')).toBe('transparent');
  });

  it('SimplifiedDiagram respects earthFill prop', () => {
    const { container } = withFakeContainerSize(800, 1200, () =>
      render(<SimplifiedDiagram well={buildWell()} earthFill="#f5f5f5" />),
    );
    const rect = container.querySelector('g.layer-earth rect');
    expect(rect?.getAttribute('fill')).toBe('#f5f5f5');
  });
});
