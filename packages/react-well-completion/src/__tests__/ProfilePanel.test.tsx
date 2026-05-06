import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProfilePanel from '../components/profiles/ProfilePanel';
import { TooltipProvider } from '../components/Tooltip';
import type { Profile } from '../types';

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <TooltipProvider>
      <svg width={800} height={600}>{ui}</svg>
    </TooltipProvider>,
  );

const baseProfile: Profile = {
  id: 'p1',
  name: 'Presión',
  unit: 'psi',
  data: [
    { depth: 100, value: 1000 },
    { depth: 500, value: 2000 },
  ],
};

const tempProfile: Profile = {
  id: 't1',
  name: 'Temp',
  unit: '°F',
  data: [
    { depth: 100, value: 80 },
    { depth: 500, value: 120 },
  ],
};

describe('ProfilePanel — vertical', () => {
  const props = {
    profiles: [baseProfile, tempProfile],
    trackWidth: 140,
    panelHeight: 400,
    panelWidth: 280,
    depthToPos: (d: number) => d / 5,
    totalDepth: 1000,
    orientation: 'vertical' as const,
  };

  it('renders one track per profile', () => {
    const { container } = renderInSvg(<ProfilePanel {...props} />);
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks.length).toBe(2);
  });

  it('renders tracks side-by-side at the configured width', () => {
    const { container } = renderInSvg(<ProfilePanel {...props} />);
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks[0].getAttribute('width')).toBe('140');
    expect(tracks[1].getAttribute('width')).toBe('140');
  });

  it('uses palette colors when profile.color is undefined', () => {
    const { container } = renderInSvg(<ProfilePanel {...props} />);
    const polylines = container.querySelectorAll('polyline');
    expect(polylines[0].getAttribute('stroke')).toBe('#0ea5e9');
    expect(polylines[1].getAttribute('stroke')).toBe('#ef4444');
  });

  it('uses explicit color when profile.color is set', () => {
    const profilesWithColor: Profile[] = [
      { ...baseProfile, color: '#123456' },
      tempProfile,
    ];
    const { container } = renderInSvg(
      <ProfilePanel {...props} profiles={profilesWithColor} />,
    );
    const polylines = container.querySelectorAll('polyline');
    expect(polylines[0].getAttribute('stroke')).toBe('#123456');
    expect(polylines[1].getAttribute('stroke')).toBe('#ef4444');
  });
});

describe('ProfilePanel — horizontal', () => {
  it('renders tracks stacked vertically with full width', () => {
    const { container } = renderInSvg(
      <ProfilePanel
        profiles={[baseProfile, tempProfile]}
        trackWidth={140}
        panelHeight={280}
        panelWidth={600}
        depthToPos={(d: number) => d / 2}
        totalDepth={1000}
        orientation="horizontal"
      />,
    );
    const tracks = container.querySelectorAll('rect.profile-track-border');
    expect(tracks.length).toBe(2);
    expect(tracks[0].getAttribute('width')).toBe('600');
    expect(tracks[0].getAttribute('height')).toBe('140');
  });
});

describe('ProfilePanel — empty', () => {
  it('renders nothing when profiles is empty array', () => {
    const { container } = renderInSvg(
      <ProfilePanel
        profiles={[]}
        trackWidth={140}
        panelHeight={400}
        panelWidth={0}
        depthToPos={(d: number) => d}
        totalDepth={1000}
        orientation="vertical"
      />,
    );
    expect(container.querySelector('rect.profile-track-border')).toBeNull();
    expect(container.querySelector('polyline')).toBeNull();
  });
});
