import type { DiagramConfig, TubingSegment } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';
import { useTooltip } from '../tooltip-context';

interface Props {
  tubingString: TubingSegment[];
  config: DiagramConfig;
}

export default function TubingLayer({ tubingString, config }: Props) {
  const { show, move, hide } = useTooltip();
  const sorted = [...tubingString].sort((a, b) => a.segment - b.segment);

  const depths = sorted.reduce<{ top: number; base: number }[]>((acc, seg) => {
    const top = acc.length > 0 ? acc[acc.length - 1].base : 0;
    return [...acc, { top, base: top + seg.length }];
  }, []);

  return (
    <g className="layer-tubing">
      {sorted.map((seg, idx) => {
        const { top, base } = depths[idx];

        const { x1, x2 } = diameterToX(config, seg.diameter);
        const y1 = config.depthToPos(top);
        const y2 = config.depthToPos(base);

        const info = [
          'Tipo: Tubing',
          `Segmento: ${seg.segment}`,
          `Longitud: ${seg.length} ft`,
          `Diámetro: ${seg.diameter}"`,
          `Prof: ${top} - ${base} ft`,
        ];

        const half = config.halfSection;
        const showLeft = !half || config.halfSide === 'left';
        const showRight = !half || config.halfSide === 'right';

        // Connection to previous segment if diameter changes
        const prev = idx > 0 ? sorted[idx - 1] : null;
        let connector = null;
        if (prev && prev.diameter !== seg.diameter) {
          const { x1: px1, x2: px2 } = diameterToX(config, prev.diameter);
          connector = (
            <g>
              {showLeft && <line x1={px1} y1={y1} x2={x1} y2={y1} stroke="gray" strokeWidth={1} />}
              {showRight && <line x1={px2} y1={y1} x2={x2} y2={y1} stroke="gray" strokeWidth={1} />}
            </g>
          );
        }

        return (
          <g key={seg.id}>
            {connector}
            {showLeft && (
              <line
                x1={x1} y1={y1} x2={x1} y2={y2}
                stroke="gray" strokeWidth={2.5}
                onMouseEnter={e => show(e, info)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            )}
            {showRight && (
              <line
                x1={x2} y1={y1} x2={x2} y2={y2}
                stroke="gray" strokeWidth={2.5}
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
