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
});
