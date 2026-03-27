import type { DiagramConfig, Sand } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';
import { useTooltip } from '../Tooltip';

interface Props {
  sands: Sand[];
  minCasingDiameter: number;
  config: DiagramConfig;
}

export default function SandLayer({ sands, minCasingDiameter, config }: Props) {
  const { show, move, hide } = useTooltip();
  const { x1, x2 } = diameterToX(config, minCasingDiameter);

  return (
    <g className="layer-sands">
      {sands.map((sand) => {
        const y = config.depthToPos(sand.top);
        const h = config.depthToPos(sand.base) - y;
        const pattern = sand.segment % 2 === 0 ? 'url(#sandB)' : 'url(#sandA)';
        const info = [`${sand.name}`, `Tope: ${sand.top} ft`, `Base: ${sand.base} ft`];

        const half = config.halfSection;
        const showLeft = !half || config.halfSide === 'left';
        const showRight = !half || config.halfSide === 'right';

        return (
          <g key={sand.id}>
            {/* Left side sand */}
            {showLeft && (
              <rect
                x={0} y={y} width={x1} height={h}
                fill={pattern}
                onMouseEnter={e => show(e, info)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            )}
            {/* Right side sand */}
            {showRight && (
              <rect
                x={x2} y={y} width={config.width - x2} height={h}
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
}
