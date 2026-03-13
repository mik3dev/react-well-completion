import type { DiagramConfig, RodSegment } from '../../../types';
import { useTooltip } from '../Tooltip';

interface Props {
  rodString: RodSegment[];
  config: DiagramConfig;
}

export default function RodLayer({ rodString, config }: Props) {
  const { show, move, hide } = useTooltip();
  const sorted = [...rodString].sort((a, b) => a.segment - b.segment);

  let accDepth = 0;

  return (
    <g className="layer-rods">
      {sorted.map((seg) => {
        const top = accDepth;
        accDepth += seg.length;
        const base = accDepth;

        const rodWidth = seg.diameter * config.pulgada;
        const x = config.centerX - rodWidth / 2;
        const y = config.depthToY(top);
        const h = config.depthToY(base) - y;

        const info = [
          'Tipo: Cabilla',
          `Segmento: ${seg.segment}`,
          `Longitud: ${seg.length} ft`,
          `Diámetro: ${seg.diameter}"`,
        ];

        return (
          <rect
            key={seg.id}
            x={x} y={y} width={rodWidth} height={h}
            fill="#b0b0b0" stroke="#555" strokeWidth={0.5}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          />
        );
      })}
    </g>
  );
}
