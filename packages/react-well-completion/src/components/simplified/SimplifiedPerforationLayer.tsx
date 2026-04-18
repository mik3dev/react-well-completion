import type { Casing, DiagramConfig, Perforation } from '../../types';
import { computeCasingPositions } from '../../hooks/use-diagram-config';

interface Props {
  perforations: Perforation[];
  casings: Casing[];
  config: DiagramConfig;
}

const WALL = 5;

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

export default function SimplifiedPerforationLayer({ perforations, casings, config }: Props) {
  const casingPos = computeCasingPositions(casings, config);
  const outerLen = config.pulgada * 0.7;

  return (
    <g>
      {perforations.map(perf => {
        const innerCasing = findInnerCasing(perf.top, perf.base, casings);
        if (!innerCasing) return null;
        const pos = casingPos.get(innerCasing.id);
        if (!pos) return null;

        const leftWall = pos.x1 - WALL / 2;
        const rightWall = pos.x2 + WALL / 2;

        const yTop = config.depthToPos(perf.top);
        const yBase = config.depthToPos(perf.base);
        const intervalH = yBase - yTop;
        const minSpacing = Math.max(config.pulgada * 0.5, 5);
        const numShots = Math.max(3, Math.floor(intervalH / minSpacing));
        const spacing = intervalH / (numShots + 1);

        const lines = [];
        for (let i = 1; i <= numShots; i++) {
          const y = yTop + spacing * i;
          lines.push(
            <g key={`${perf.id}-${i}`}>
              <line x1={leftWall - outerLen} y1={y} x2={leftWall} y2={y} stroke="#333" strokeWidth={0.8} />
              <line x1={rightWall} y1={y} x2={rightWall + outerLen} y2={y} stroke="#333" strokeWidth={0.8} />
            </g>
          );
        }

        return <g key={perf.id}>{lines}</g>;
      })}
    </g>
  );
}
