import type { Casing, DiagramConfig, Sand } from '../../types';
import { computeCasingPositions } from '../../hooks/use-diagram-config';
import { useTooltip } from '../tooltip-context';

interface Props {
  sands: Sand[];
  casings: Casing[];
  config: DiagramConfig;
}

const WALL = 5; // casing wall thickness (must match CasingLayer)

interface SandSegment {
  top: number;
  base: number;
  /** Outermost casing at this sub-segment. If null, no casing — sand fills full width. */
  casingId: string | null;
}

/**
 * Splits a sand's depth range at casing boundaries and resolves, for each
 * sub-segment, the outermost (largest) containing casing. Sand is formation
 * material outside all casings, so it must be drawn beyond the outermost wall.
 */
function computeSandSegments(
  topDepth: number,
  bottomDepth: number,
  casings: Casing[],
): SandSegment[] {
  const breakpoints = new Set<number>([topDepth, bottomDepth]);

  for (const c of casings) {
    if (c.top > topDepth && c.top < bottomDepth) breakpoints.add(c.top);
    if (c.base > topDepth && c.base < bottomDepth) breakpoints.add(c.base);
  }

  const sorted = [...breakpoints].sort((a, b) => a - b);
  const segments: SandSegment[] = [];

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

export default function SandLayer({ sands, casings, config }: Props) {
  const { show, move, hide } = useTooltip();
  const casingPos = computeCasingPositions(casings, config);

  const half = config.halfSection;
  const showLeft = !half || config.halfSide === 'left';
  const showRight = !half || config.halfSide === 'right';

  return (
    <g className="layer-sands">
      {sands.map((sand) => {
        const pattern = sand.segment % 2 === 0 ? 'url(#sandB)' : 'url(#sandA)';
        const info = [`${sand.name}`, `Tope: ${sand.top} ft`, `Base: ${sand.base} ft`];
        const segments = computeSandSegments(sand.top, sand.base, casings);

        return (
          <g key={sand.id}>
            {segments.map((seg, idx) => {
              const y = config.depthToPos(seg.top);
              const h = config.depthToPos(seg.base) - y;
              if (h <= 0) return null;

              // Resolve inner edge of sand fill: outside outermost casing wall, or
              // full width if no casing at this depth.
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
                <g key={`${sand.id}-${idx}`}>
                  {showLeft && leftEdge > 0 && (
                    <rect
                      x={0} y={y} width={leftEdge} height={h}
                      fill={pattern}
                      onMouseEnter={e => show(e, info)}
                      onMouseMove={move}
                      onMouseLeave={hide}
                    />
                  )}
                  {showRight && rightEdge < config.width && (
                    <rect
                      x={rightEdge} y={y} width={config.width - rightEdge} height={h}
                      fill={pattern}
                      onMouseEnter={e => show(e, info)}
                      onMouseMove={move}
                      onMouseLeave={hide}
                    />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
