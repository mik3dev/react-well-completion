import type { DiagramConfig, Mandrel } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';

interface Props {
  mandrels: Mandrel[];
  config: DiagramConfig;
}

export default function SimplifiedMandrelLayer({ mandrels, config }: Props) {
  const sw = 3.5;
  const armLen = 12;
  const legLen = 10;

  return (
    <g>
      {mandrels.map(m => {
        const { x1, x2 } = diameterToX(config, m.diameter);
        const tubingW = x2 - x1;
        const y = config.depthToPos(m.depth);
        const color = m.valveType === 'operating' ? '#555' : m.valveType === 'dummy' ? '#888' : '#aaa';
        const dashArray = m.valveType === 'dummy' ? '4,3' : undefined;

        // Same L-shape as MandrelIcon, always on right side
        const wallX = x1 + tubingW;
        const armEndX = wallX + armLen;
        const legEndY = y - legLen;

        return (
          <g key={m.id}>
            <line x1={wallX} y1={y} x2={armEndX} y2={y} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dashArray} />
            <line x1={armEndX} y1={y} x2={armEndX} y2={legEndY} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dashArray} />
          </g>
        );
      })}
    </g>
  );
}
