import type { DiagramConfig, Casing } from '../../types';
import { computeCasingPositions } from '../../hooks/use-diagram-config';

interface Props {
  casings: Casing[];
  config: DiagramConfig;
}

const WALL = 4;

export default function SimplifiedCasingLayer({ casings, config }: Props) {
  const sorted = [...casings].sort((a, b) => b.diameter - a.diameter);
  const posMap = computeCasingPositions(casings, config);
  const positions = sorted.map(c => posMap.get(c.id)!);

  return (
    <g>
      {sorted.map((casing, idx) => {
        const { x1, x2 } = positions[idx];
        const y = config.depthToPos(casing.top);
        const h = config.depthToPos(casing.base) - y;

        // Connector to previous (larger) casing
        const prev = idx > 0 ? sorted[idx - 1] : null;
        let connector = null;
        if (prev && prev.diameter > casing.diameter) {
          const { x1: px1, x2: px2 } = positions[idx - 1];
          connector = (
            <g>
              <line x1={px1} y1={y} x2={x1} y2={y} stroke="#555" strokeWidth={1} />
              <line x1={x2} y1={y} x2={px2} y2={y} stroke="#555" strokeWidth={1} />
            </g>
          );
        }

        // Shoe triangles
        const shoeH = WALL * 1.5;
        const shoeW = WALL * 2;

        return (
          <g key={casing.id}>
            {connector}
            {/* Left wall */}
            <rect x={x1 - WALL / 2} y={y} width={WALL} height={h} fill="#ccc" stroke="#555" strokeWidth={0.5} />
            {/* Right wall */}
            <rect x={x2 - WALL / 2} y={y} width={WALL} height={h} fill="#ccc" stroke="#555" strokeWidth={0.5} />
            {/* Left shoe */}
            <polygon
              points={`${x1 - WALL / 2},${y + h - shoeH} ${x1 - WALL / 2 - shoeW},${y + h} ${x1 - WALL / 2},${y + h}`}
              fill="#888" stroke="#555" strokeWidth={0.5}
            />
            {/* Right shoe */}
            <polygon
              points={`${x2 + WALL / 2},${y + h - shoeH} ${x2 + WALL / 2 + shoeW},${y + h} ${x2 + WALL / 2},${y + h}`}
              fill="#888" stroke="#555" strokeWidth={0.5}
            />
          </g>
        );
      })}
    </g>
  );
}
