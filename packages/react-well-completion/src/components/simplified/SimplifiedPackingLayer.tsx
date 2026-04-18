import type { DiagramConfig, Packing, Casing, TubingSegment } from '../../types';
import { diameterToX, computeCasingPositions } from '../../hooks/use-diagram-config';

interface Props {
  packings: Packing[];
  casings: Casing[];
  tubingString?: TubingSegment[];
  config: DiagramConfig;
}

const WALL = 4;

function resolveDiameter(
  componentDiameter: number,
  depth: number,
  tubing: TubingSegment[],
): number {
  if (componentDiameter > 0) return componentDiameter;
  if (tubing.length === 0) return 0;
  const seg = tubing.find(t =>
    t.top != null && t.base != null && depth >= t.top && depth <= t.base,
  );
  if (seg) return seg.diameter;
  return tubing[0].diameter;
}

export default function SimplifiedPackingLayer({ packings, casings, tubingString = [], config }: Props) {
  const PK_H = config.pulgada * 0.6;
  const casingPos = computeCasingPositions(casings, config);

  return (
    <g>
      {packings.map(pk => {
        const effectiveDiameter = resolveDiameter(pk.diameter, pk.depth, tubingString);
        const { x1: tbgX1, x2: tbgX2 } = diameterToX(config, effectiveDiameter);
        const y = config.depthToPos(pk.depth);

        const containingCasing = casings
          .filter(c => c.top <= pk.depth && c.base >= pk.depth)
          .sort((a, b) => a.diameter - b.diameter)[0];

        let csgX1: number, csgX2: number;
        if (containingCasing) {
          const pos = casingPos.get(containingCasing.id)!;
          csgX1 = pos.x1;
          csgX2 = pos.x2;
        } else {
          const fallback = diameterToX(config, pk.od || effectiveDiameter + 2);
          csgX1 = fallback.x1;
          csgX2 = fallback.x2;
        }

        const half = PK_H / 2;
        // Left X: between casing wall and tubing left wall
        const lx1 = csgX1 + WALL / 2;
        const lx2 = tbgX1;
        // Right X: between tubing right wall and casing wall
        const rx1 = tbgX2;
        const rx2 = csgX2 - WALL / 2;

        return (
          <g key={pk.id}>
            {/* Left X */}
            <line x1={lx1} y1={y - half} x2={lx2} y2={y + half} stroke="#555" strokeWidth={1.5} />
            <line x1={lx1} y1={y + half} x2={lx2} y2={y - half} stroke="#555" strokeWidth={1.5} />
            {/* Right X */}
            <line x1={rx1} y1={y - half} x2={rx2} y2={y + half} stroke="#555" strokeWidth={1.5} />
            <line x1={rx1} y1={y + half} x2={rx2} y2={y - half} stroke="#555" strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
}
