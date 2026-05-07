import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProfileCurve from '../components/profiles/ProfileCurve';
import { TooltipProvider } from '../components/Tooltip';

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <TooltipProvider>
      <svg width={200} height={400}>{ui}</svg>
    </TooltipProvider>,
  );

describe('ProfileCurve', () => {
  const baseProps = {
    profile: { id: 'p1', name: 'Pres', unit: 'psi', data: [
      { depth: 100, value: 1000 },
      { depth: 200, value: 2000 },
    ]},
    color: '#0ea5e9',
    depthToPos: (d: number) => d / 10,        // simple linear for tests
    valueRange: { a: 0, b: 100 },
    scale: { min: 0, max: 2000 },
    orientation: 'vertical' as const,
  };

  it('renders a polyline when there are 2+ points', () => {
    const { container } = renderInSvg(<ProfileCurve {...baseProps} />);
    const poly = container.querySelector('polyline');
    expect(poly).not.toBeNull();
    expect(poly?.getAttribute('stroke')).toBe('#0ea5e9');
  });

  it('renders one circle per data point as hover trigger when length >= 2', () => {
    const { container } = renderInSvg(<ProfileCurve {...baseProps} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('renders a single visible circle when data has 1 point', () => {
    const props = {
      ...baseProps,
      profile: { ...baseProps.profile, data: [{ depth: 150, value: 1500 }] },
    };
    const { container } = renderInSvg(<ProfileCurve {...props} />);
    expect(container.querySelector('polyline')).toBeNull();
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
    expect(circles[0].getAttribute('fill')).toBe('#0ea5e9');
  });

  it('renders nothing when data is empty', () => {
    const props = {
      ...baseProps,
      profile: { ...baseProps.profile, data: [] },
    };
    const { container } = renderInSvg(<ProfileCurve {...props} />);
    expect(container.querySelector('polyline')).toBeNull();
    expect(container.querySelector('circle')).toBeNull();
  });

  it('vertical: maps depth to y-axis and value to x-axis', () => {
    const { container } = renderInSvg(<ProfileCurve {...baseProps} />);
    const poly = container.querySelector('polyline');
    // depth=100 → y=10; value=1000 → x = 0 + (1000/2000) * 100 = 50 → "50,10"
    // depth=200 → y=20; value=2000 → x=100 → "100,20"
    expect(poly?.getAttribute('points')).toBe('50,10 100,20');
  });

  it('horizontal: maps depth to x-axis and value to y-axis (inverted)', () => {
    const { container } = renderInSvg(
      <ProfileCurve
        {...baseProps}
        orientation="horizontal"
        valueRange={{ a: 100, b: 0 }} // inverted: low value at bottom (high y)
      />,
    );
    const poly = container.querySelector('polyline');
    // depth=100 → x=10; value=1000 → y = 100 + (1000/2000) * (0 - 100) = 50 → "10,50"
    // depth=200 → x=20; value=2000 → y = 0 → "20,0"
    expect(poly?.getAttribute('points')).toBe('10,50 20,0');
  });

  it('shows tooltip on mouseEnter over a hover dot', async () => {
    const { container } = renderInSvg(<ProfileCurve {...baseProps} />);

    // Hover dots are the transparent circles (in the multi-point case).
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);

    // Trigger mouseEnter on the first hover dot.
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.mouseEnter(circles[0]);

    // Tooltip is rendered into the document body (TooltipProvider portals it).
    // Look for the formatted tooltip text in the rendered output.
    const fullText = document.body.textContent ?? '';
    expect(fullText).toContain('Pres:');
    expect(fullText).toContain('1000');
    expect(fullText).toContain('psi');
    expect(fullText).toContain('100');
    expect(fullText).toContain('ft');
  });
});
