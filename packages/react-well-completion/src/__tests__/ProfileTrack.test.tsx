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
