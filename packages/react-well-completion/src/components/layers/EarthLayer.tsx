import type { Casing, DiagramConfig, TubingSegment } from '../../types';
import { computeCasingPositions, diameterToX } from '../../hooks/use-diagram-config';
import { useTooltip } from '../tooltip-context';

interface Props {
  totalFreeDepth: number;
  totalDepth: number;
  casings: Casing[];
  tubingString: TubingSegment[];
  config: DiagramConfig;
}

const WALL = 5; // casing wall thickness (must match CasingLayer)

interface EarthSegment {
  top: number;
  base: number;
  casingId: string | null;      // smallest containing casing at this segment
  tubingDiameter: number | null; // tubing diameter at this segment, if any
}

/**
 * Splits the range [topDepth, bottomDepth] at casing/tubing boundaries
 * and resolves, for each sub-segment, the smallest containing casing
 * and the active tubing diameter.
 */
function computeEarthSegments(
  topDepth: number,
  bottomDepth: number,
  casings: Casing[],
  tubing: TubingSegment[],
): EarthSegment[] {
  const breakpoints = new Set<number>([topDepth, bottomDepth]);

  for (const c of casings) {
    if (c.top > topDepth && c.top < bottomDepth) breakpoints.add(c.top);
    if (c.base > topDepth && c.base < bottomDepth) breakpoints.add(c.base);
  }
  for (const t of tubing) {
    if (t.top != null && t.top > topDepth && t.top < bottomDepth) breakpoints.add(t.top);
    if (t.base != null && t.base > topDepth && t.base < bottomDepth) breakpoints.add(t.base);
  }

  const sorted = [...breakpoints].sort((a, b) => a - b);
  const segments: EarthSegment[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const top = sorted[i];
    const base = sorted[i + 1];
    const mid = (top + base) / 2;

    const innerCasing = casings
      .filter(c => c.top <= mid && c.base >= mid)
      .sort((a, b) => a.diameter - b.diameter)[0];

    const activeTubing = tubing.find(t =>
      t.top != null && t.base != null && mid >= t.top && mid <= t.base,
    );

    segments.push({
      top,
      base,
      casingId: innerCasing?.id ?? null,
      tubingDiameter: activeTubing?.diameter ?? null,
    });
  }

  return segments;
}

export default function EarthLayer({ totalFreeDepth, totalDepth, casings, tubingString, config }: Props) {
  const { show, move, hide } = useTooltip();

  if (!totalFreeDepth || totalFreeDepth >= totalDepth) return null;
  if (casings.length === 0) return null;

  const casingPos = computeCasingPositions(casings, config);
  const segments = computeEarthSegments(totalFreeDepth, totalDepth, casings, tubingString);

  const tooltipInfo = [
    `Profundidad Total: ${totalDepth} ft`,
    `Profundidad Libre: ${totalFreeDepth} ft`,
  ];

  return (
    <g className="layer-earth">
      {segments.map((seg, idx) => {
        if (!seg.casingId) return null;
        const pos = casingPos.get(seg.casingId);
        if (!pos) return null;

        const y = config.depthToPos(seg.top);
        const h = config.depthToPos(seg.base) - y;
        if (h <= 0) return null;

        const innerX1 = pos.x1 + WALL / 2;
        const innerX2 = pos.x2 - WALL / 2;

        // If tubing is present, split into two rects (left annulus + right annulus)
        if (seg.tubingDiameter != null) {
          const { x1: tbgX1, x2: tbgX2 } = diameterToX(config, seg.tubingDiameter);
          const leftW = tbgX1 - innerX1;
          const rightW = innerX2 - tbgX2;

          return (
            <g key={`earth-${idx}`}>
              {leftW > 0 && (
                <rect
                  x={innerX1} y={y} width={leftW} height={h}
                  fill="url(#earthFill)"
                  onMouseEnter={e => show(e, tooltipInfo)}
                  onMouseMove={move}
                  onMouseLeave={hide}
                />
              )}
              {rightW > 0 && (
                <rect
                  x={tbgX2} y={y} width={rightW} height={h}
                  fill="url(#earthFill)"
                  onMouseEnter={e => show(e, tooltipInfo)}
                  onMouseMove={move}
                  onMouseLeave={hide}
                />
              )}
            </g>
          );
        }

        // No tubing: fill entire casing interior
        return (
          <rect
            key={`earth-${idx}`}
            x={innerX1} y={y} width={innerX2 - innerX1} height={h}
            fill="url(#earthFill)"
            onMouseEnter={e => show(e, tooltipInfo)}
            onMouseMove={move}
            onMouseLeave={hide}
          />
        );
      })}
    </g>
  );
}
