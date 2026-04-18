import type { DiagramConfig, Mandrel, TubingSegment } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';

interface Props {
  mandrels: Mandrel[];
  tubingString?: TubingSegment[];
  config: DiagramConfig;
}

function resolveDiameter(
  componentDiameter: number,
  depth: number,
  tubing: TubingSegment[],
): number {
  if (componentDiameter > 0) return componentDiameter;
  if (tubing.length === 0) return 0;
  const seg = tubing.find(t =>
    t.top != null && t.base != null && depth >= t.top && depth <= t.base,
  );
  if (seg) return seg.diameter;
  return tubing[0].diameter;
}

export default function SimplifiedMandrelLayer({ mandrels, tubingString = [], config }: Props) {
  const sw = 3.5;
  const armLen = 12;
  const legLen = 10;

  return (
    <g>
      {mandrels.map(m => {
        const effectiveDiameter = resolveDiameter(m.diameter, m.depth, tubingString);
        const { x1, x2 } = diameterToX(config, effectiveDiameter);
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
