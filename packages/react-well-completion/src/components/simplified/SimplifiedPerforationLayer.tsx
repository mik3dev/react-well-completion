import type { DiagramConfig, Perforation } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';

interface Props {
  perforations: Perforation[];
  minCasingDiameter: number;
  config: DiagramConfig;
}

export default function SimplifiedPerforationLayer({ perforations, minCasingDiameter, config }: Props) {
  const { x1, x2 } = diameterToX(config, minCasingDiameter);
  const outerLen = config.pulgada * 0.7;

  return (
    <g>
      {perforations.map(perf => {
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
              <line x1={x1 - outerLen} y1={y} x2={x1} y2={y} stroke="#333" strokeWidth={0.8} />
              <line x1={x2} y1={y} x2={x2 + outerLen} y2={y} stroke="#333" strokeWidth={0.8} />
            </g>
          );
        }

        return <g key={perf.id}>{lines}</g>;
      })}
    </g>
  );
}
