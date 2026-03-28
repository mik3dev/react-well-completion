import type { DiagramConfig, TubingSegment } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';

interface Props {
  tubingString: TubingSegment[];
  config: DiagramConfig;
}

export default function SimplifiedTubingLayer({ tubingString, config }: Props) {
  const sorted = [...tubingString].sort((a, b) => a.segment - b.segment);

  const depths = sorted.reduce<{ top: number; base: number }[]>((acc, seg) => {
    const top = acc.length > 0 ? acc[acc.length - 1].base : 0;
    return [...acc, { top, base: top + seg.length }];
  }, []);

  return (
    <g>
      {sorted.map((seg, idx) => {
        const { top, base } = depths[idx];

        const { x1, x2 } = diameterToX(config, seg.diameter);
        const y1 = config.depthToPos(top);
        const y2 = config.depthToPos(base);

        // Connector to previous segment
        const prev = idx > 0 ? sorted[idx - 1] : null;
        let connector = null;
        if (prev && prev.diameter !== seg.diameter) {
          const { x1: px1, x2: px2 } = diameterToX(config, prev.diameter);
          connector = (
            <g>
              <line x1={px1} y1={y1} x2={x1} y2={y1} stroke="#777" strokeWidth={1} />
              <line x1={px2} y1={y1} x2={x2} y2={y1} stroke="#777" strokeWidth={1} />
            </g>
          );
        }

        return (
          <g key={seg.id}>
            {connector}
            <line x1={x1} y1={y1} x2={x1} y2={y2} stroke="#666" strokeWidth={2} />
            <line x1={x2} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
}
