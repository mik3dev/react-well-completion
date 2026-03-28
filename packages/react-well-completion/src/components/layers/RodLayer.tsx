import type { DiagramConfig, RodSegment } from '../../types';
import { useTooltip } from '../tooltip-context';

interface Props {
  rodString: RodSegment[];
  config: DiagramConfig;
}

export default function RodLayer({ rodString, config }: Props) {
  const { show, move, hide } = useTooltip();
  const sorted = [...rodString].sort((a, b) => a.segment - b.segment);

  const depths = sorted.reduce<{ top: number; base: number }[]>((acc, seg) => {
    const top = acc.length > 0 ? acc[acc.length - 1].base : 0;
    return [...acc, { top, base: top + seg.length }];
  }, []);

  return (
    <g className="layer-rods">
      {sorted.map((seg, segIdx) => {
        const { top, base } = depths[segIdx];

        const fullRodW = seg.diameter * config.pulgada;
        const rodWidth = config.halfSection ? fullRodW / 2 : fullRodW;
        const x = config.halfSection
          ? (config.halfSide === 'right' ? config.centerLine : config.centerLine - rodWidth)
          : config.centerLine - fullRodW / 2;
        const y = config.depthToPos(top);
        const h = config.depthToPos(base) - y;

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
