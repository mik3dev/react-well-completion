import type { DiagramConfig, Packer, TubingSegment } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';

interface Props {
  packers: Packer[];
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

export default function SimplifiedPackerLayer({ packers, tubingString = [], config }: Props) {
  const PK_H = config.pulgada * 0.7;

  return (
    <g>
      {/* Hatch pattern for packers */}
      <defs>
        <pattern id="simplified-packer-hatch" patternUnits="userSpaceOnUse" width={4} height={4} patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={4} stroke="#666" strokeWidth={0.8} />
        </pattern>
      </defs>
      {packers.map(packer => {
        const y = config.depthToPos(packer.depth);
        const effectiveDiameter = resolveDiameter(packer.diameter, packer.depth, tubingString);
        const { x1, x2 } = diameterToX(config, effectiveDiameter);
        const pkW = config.pulgada * 1.2;

        return (
          <g key={packer.id}>
            {/* Left packer */}
            <rect
              x={x1 - pkW} y={y - PK_H / 2}
              width={pkW} height={PK_H}
              fill="url(#simplified-packer-hatch)" stroke="#555" strokeWidth={0.8}
            />
            {/* Right packer */}
            <rect
              x={x2} y={y - PK_H / 2}
              width={pkW} height={PK_H}
              fill="url(#simplified-packer-hatch)" stroke="#555" strokeWidth={0.8}
            />
          </g>
        );
      })}
    </g>
  );
}
