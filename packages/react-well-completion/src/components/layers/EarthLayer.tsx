import type { Casing, DiagramConfig } from '../../types';
import { computeCasingPositions } from '../../hooks/use-diagram-config';
import { useTooltip } from '../tooltip-context';

interface Props {
  totalFreeDepth: number;
  totalDepth: number;
  casings: Casing[];
  config: DiagramConfig;
  /**
   * Fill used for the earth/formation rectangles.
   * Defaults to the SVG pattern `url(#earthFill)`. Pass `'transparent'`,
   * `'#ffffff'`, or any CSS color to override.
   */
  fill?: string;
}

const WALL = 5; // casing wall thickness (must match CasingLayer)

interface EarthSegment {
  top: number;
  base: number;
  /** Outermost casing at this sub-segment. If null, no casing — earth fills full width. */
  casingId: string | null;
}

/**
 * Splits [topDepth, bottomDepth] at casing boundaries and resolves, for each
 * sub-segment, the outermost (largest) containing casing. Earth/formation is
 * always rendered outside all casings since the casing isolates the wellbore
 * from the surrounding formation.
 */
function computeEarthSegments(
  topDepth: number,
  bottomDepth: number,
  casings: Casing[],
): EarthSegment[] {
  const breakpoints = new Set<number>([topDepth, bottomDepth]);

  for (const c of casings) {
    if (c.top > topDepth && c.top < bottomDepth) breakpoints.add(c.top);
    if (c.base > topDepth && c.base < bottomDepth) breakpoints.add(c.base);
  }

  const sorted = [...breakpoints].sort((a, b) => a - b);
  const segments: EarthSegment[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const top = sorted[i];
    const base = sorted[i + 1];
    const mid = (top + base) / 2;

    const outerCasing = casings
      .filter(c => c.top <= mid && c.base >= mid)
      .sort((a, b) => b.diameter - a.diameter)[0];

    segments.push({
      top,
      base,
      casingId: outerCasing?.id ?? null,
    });
  }

  return segments;
}

export default function EarthLayer({ totalFreeDepth, totalDepth, casings, config, fill = 'url(#earthFill)' }: Props) {
  const { show, move, hide } = useTooltip();

  // Top of the earth visualization = deepest shoe among non-liner casings.
  // Rationale: below that depth the only protection between wellbore and
  // formation is the liner (or open hole), which is the productive zone.
  // HUD (totalFreeDepth) is intentionally not used here — it represents an
  // operational restriction that doesn't change where the formation is.
  const nonLinerCasings = casings.filter(c => !c.isLiner);
  if (nonLinerCasings.length === 0) return null;
  const earthTop = Math.max(...nonLinerCasings.map(c => c.base));
  if (earthTop >= totalDepth) return null;

  const casingPos = computeCasingPositions(casings, config);
  const segments = computeEarthSegments(earthTop, totalDepth, casings);

  const tooltipInfo = [
    `Profundidad Total: ${totalDepth} ft`,
    ...(totalFreeDepth > 0 ? [`Profundidad Libre: ${totalFreeDepth} ft`] : []),
  ];

  const half = config.halfSection;
  const showLeft = !half || config.halfSide === 'left';
  const showRight = !half || config.halfSide === 'right';

  return (
    <g className="layer-earth">
      {segments.map((seg, idx) => {
        const y = config.depthToPos(seg.top);
        const h = config.depthToPos(seg.base) - y;
        if (h <= 0) return null;

        // Resolve outer edges: outside the outermost casing wall, or full width
        // if there is no casing at this depth (open hole).
        let leftEdge: number;
        let rightEdge: number;
        if (seg.casingId) {
          const pos = casingPos.get(seg.casingId);
          if (!pos) return null;
          leftEdge = pos.x1 - WALL / 2;
          rightEdge = pos.x2 + WALL / 2;
        } else {
          leftEdge = config.centerX;
          rightEdge = config.centerX;
        }

        return (
          <g key={`earth-${idx}`}>
            {showLeft && leftEdge > 0 && (
              <rect
                x={0} y={y} width={leftEdge} height={h}
                fill={fill}
                onMouseEnter={e => show(e, tooltipInfo)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            )}
            {showRight && rightEdge < config.width && (
              <rect
                x={rightEdge} y={y} width={config.width - rightEdge} height={h}
                fill={fill}
                onMouseEnter={e => show(e, tooltipInfo)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
