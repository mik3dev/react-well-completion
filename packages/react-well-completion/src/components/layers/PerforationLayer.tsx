import type { Casing, DiagramConfig, Perforation } from '../../types';
import { computeCasingPositions } from '../../hooks/use-diagram-config';
import { useTooltip } from '../tooltip-context';

interface Props {
  perforations: Perforation[];
  casings: Casing[];
  config: DiagramConfig;
}

const WALL = 5; // casing wall thickness (must match CasingLayer)

/**
 * Returns the smallest casing that contains the given depth range.
 * The perforation is physically made through this casing wall.
 */
function findInnerCasing(
  top: number,
  base: number,
  casings: Casing[],
): Casing | null {
  const mid = (top + base) / 2;
  return casings
    .filter(c => c.top <= mid && c.base >= mid)
    .sort((a, b) => a.diameter - b.diameter)[0] ?? null;
}

export default function PerforationLayer({ perforations, casings, config }: Props) {
  const { show, move, hide } = useTooltip();
  const casingPos = computeCasingPositions(casings, config);

  const outerLen = config.pulgada * 0.9;  // how far lines extend into the formation

  const half = config.halfSection;
  const showLeft = !half || config.halfSide === 'left';
  const showRight = !half || config.halfSide === 'right';

  return (
    <g className="layer-perforations">
      {perforations.map((perf) => {
        const yTop = config.depthToPos(perf.top);
        const yBase = config.depthToPos(perf.base);
        const intervalH = yBase - yTop;
        const isShoot = perf.type === 'shoot';

        // Resolve the casing that contains this perforation. If no casing
        // contains it, skip rendering rather than guessing.
        const innerCasing = findInnerCasing(perf.top, perf.base, casings);
        if (!innerCasing) return null;
        const pos = casingPos.get(innerCasing.id);
        if (!pos) return null;

        // Outer edge of each casing wall — perforations start here and extend
        // outward into the formation (never into the wellbore interior).
        const leftWall = pos.x1 - WALL / 2;
        const rightWall = pos.x2 + WALL / 2;

        // Density proportional to pulgada
        const minSpacing = Math.max(config.pulgada * 0.5, 6);
        const numShots = Math.max(3, Math.floor(intervalH / minSpacing));
        const spacing = intervalH / (numShots + 1);

        const lineColor = isShoot ? '#333' : '#1a4a8B';
        const borderColor = isShoot ? '#555' : '#2a7bc0';
        const strokeW = isShoot ? 1.0 : 1.8;
        const segmentLen = isShoot ? outerLen : config.pulgada * 0.45;

        const info = [
          `Tipo: ${isShoot ? 'Cañoneo' : 'Ranurado'}`,
          `Tope: ${perf.top} ft`,
          `Base: ${perf.base} ft`,
        ];

        const lines = [];
        for (let i = 1; i <= numShots; i++) {
          const y = yTop + spacing * i;
          lines.push(
            <g key={`${perf.id}-${i}`}>
              {showLeft && (
                <line
                  x1={leftWall - segmentLen} y1={y}
                  x2={leftWall} y2={y}
                  stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round"
                />
              )}
              {showRight && (
                <line
                  x1={rightWall} y1={y}
                  x2={rightWall + segmentLen} y2={y}
                  stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round"
                />
              )}
            </g>
          );
        }

        return (
          <g key={perf.id}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            {/* Bracket lines marking the perforation interval */}
            {showLeft && (
              <>
                <line
                  x1={leftWall - outerLen} y1={yTop}
                  x2={leftWall} y2={yTop}
                  stroke={borderColor} strokeWidth={0.6} strokeDasharray="3,2"
                />
                <line
                  x1={leftWall - outerLen} y1={yBase}
                  x2={leftWall} y2={yBase}
                  stroke={borderColor} strokeWidth={0.6} strokeDasharray="3,2"
                />
              </>
            )}
            {showRight && (
              <>
                <line
                  x1={rightWall} y1={yTop}
                  x2={rightWall + outerLen} y2={yTop}
                  stroke={borderColor} strokeWidth={0.6} strokeDasharray="3,2"
                />
                <line
                  x1={rightWall} y1={yBase}
                  x2={rightWall + outerLen} y2={yBase}
                  stroke={borderColor} strokeWidth={0.6} strokeDasharray="3,2"
                />
              </>
            )}
            {lines}
          </g>
        );
      })}
    </g>
  );
}
