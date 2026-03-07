import type { DiagramConfig, TubingSegment } from '../../../types';
import { diameterToX } from '../../../hooks/use-diagram-config';
import { useTooltip } from '../Tooltip';

interface Props {
  tubingString: TubingSegment[];
  config: DiagramConfig;
}

export default function TubingLayer({ tubingString, config }: Props) {
  const { show, move, hide } = useTooltip();
  const sorted = [...tubingString].sort((a, b) => a.segment - b.segment);

  let accDepth = 0;

  return (
    <g className="layer-tubing">
      {sorted.map((seg, idx) => {
        const top = accDepth;
        accDepth += seg.length;
        const base = accDepth;

        const { x1, x2 } = diameterToX(config, seg.diameter);
        const y1 = top * config.pxPerFt;
        const y2 = base * config.pxPerFt;

        const info = [
          'Tipo: Tubing',
          `Segmento: ${seg.segment}`,
          `Longitud: ${seg.length} ft`,
          `Diámetro: ${seg.diameter}"`,
          `Prof: ${top} - ${base} ft`,
        ];

        // Connection to previous segment if diameter changes
        const prev = idx > 0 ? sorted[idx - 1] : null;
        let connector = null;
        if (prev && prev.diameter !== seg.diameter) {
          const { x1: px1, x2: px2 } = diameterToX(config, prev.diameter);
          connector = (
            <g>
              <line x1={px1} y1={y1} x2={x1} y2={y1} stroke="gray" strokeWidth={1} />
              <line x1={px2} y1={y1} x2={x2} y2={y1} stroke="gray" strokeWidth={1} />
            </g>
          );
        }

        return (
          <g key={seg.id}>
            {connector}
            <line
              x1={x1} y1={y1} x2={x1} y2={y2}
              stroke="gray" strokeWidth={2.5}
              onMouseEnter={e => show(e, info)}
              onMouseMove={move}
              onMouseLeave={hide}
            />
            <line
              x1={x2} y1={y1} x2={x2} y2={y2}
              stroke="gray" strokeWidth={2.5}
              onMouseEnter={e => show(e, info)}
              onMouseMove={move}
              onMouseLeave={hide}
            />
          </g>
        );
      })}
    </g>
  );
}
