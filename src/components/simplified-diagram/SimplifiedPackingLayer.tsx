import type { DiagramConfig, Packing, Casing } from '../../types';
import { diameterToX, computeCasingPositions } from '../../hooks/use-diagram-config';

interface Props {
  packings: Packing[];
  casings: Casing[];
  config: DiagramConfig;
}

const WALL = 4;

export default function SimplifiedPackingLayer({ packings, casings, config }: Props) {
  const PK_H = config.pulgada * 0.6;
  const casingPos = computeCasingPositions(casings, config);

  return (
    <g>
      {packings.map(pk => {
        const { x1: tbgX1, x2: tbgX2 } = diameterToX(config, pk.diameter);
        const y = config.depthToPos(pk.depth);

        // Find containing casing
        const containingCasing = casings
          .filter(c => c.top <= pk.depth && c.base >= pk.depth)
          .sort((a, b) => a.diameter - b.diameter)[0];

        let csgX1: number, csgX2: number;
        if (containingCasing) {
          const pos = casingPos.get(containingCasing.id)!;
          csgX1 = pos.x1;
          csgX2 = pos.x2;
        } else {
          const fallback = diameterToX(config, pk.od || pk.diameter + 2);
          csgX1 = fallback.x1;
          csgX2 = fallback.x2;
        }

        const leftW = tbgX1 - (csgX1 + WALL / 2);
        const rightW = (csgX2 - WALL / 2) - tbgX2;

        return (
          <g key={pk.id}>
            {/* Left packing */}
            <rect
              x={csgX1 + WALL / 2} y={y - PK_H / 2}
              width={Math.max(leftW, 3)} height={PK_H}
              fill="#999" stroke="#555" strokeWidth={0.5}
            />
            {/* Right packing */}
            <rect
              x={tbgX2} y={y - PK_H / 2}
              width={Math.max(rightW, 3)} height={PK_H}
              fill="#999" stroke="#555" strokeWidth={0.5}
            />
          </g>
        );
      })}
    </g>
  );
}
