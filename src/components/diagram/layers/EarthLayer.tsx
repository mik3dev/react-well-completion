import type { DiagramConfig } from '../../../types';
import { diameterToX } from '../../../hooks/use-diagram-config';
import { useTooltip } from '../Tooltip';

interface Props {
  totalFreeDepth: number;
  totalDepth: number;
  minCasingDiameter: number;
  config: DiagramConfig;
}

export default function EarthLayer({ totalFreeDepth, totalDepth, minCasingDiameter, config }: Props) {
  const { show, move, hide } = useTooltip();

  if (!totalFreeDepth || totalFreeDepth >= totalDepth) return null;

  const { x1, x2 } = diameterToX(config, minCasingDiameter);
  const y = totalFreeDepth * config.pxPerFt;
  const h = (totalDepth - totalFreeDepth) * config.pxPerFt;

  return (
    <g className="layer-earth">
      <rect
        x={x1} y={y} width={x2 - x1} height={h}
        fill="url(#earthFill)"
        onMouseEnter={e => show(e, [
          `Profundidad Total: ${totalDepth} ft`,
          `Profundidad Libre: ${totalFreeDepth} ft`,
        ])}
        onMouseMove={move}
        onMouseLeave={hide}
      />
    </g>
  );
}
