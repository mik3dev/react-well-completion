import type { DiagramConfig, Packer } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';

interface Props {
  packers: Packer[];
  config: DiagramConfig;
}

export default function SimplifiedPackerLayer({ packers, config }: Props) {
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
        const { x1, x2 } = diameterToX(config, packer.diameter);
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
