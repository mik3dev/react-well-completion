import type { DiagramConfig } from '../../types';

interface Props {
  config: DiagramConfig;
}

export default function SimplifiedDepthAxis({ config }: Props) {
  const { maxDepth, height, width, depthToPos } = config;

  const rawInterval = maxDepth / 8;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
  const normalized = rawInterval / magnitude;
  let interval: number;
  if (normalized <= 1) interval = magnitude;
  else if (normalized <= 2) interval = 2 * magnitude;
  else if (normalized <= 5) interval = 5 * magnitude;
  else interval = 10 * magnitude;

  const ticks: number[] = [];
  for (let d = interval; d <= maxDepth; d += interval) {
    ticks.push(d);
  }

  return (
    <g>
      {ticks.map(depth => {
        const pos = depthToPos(depth);
        return (
          <g key={depth}>
            <line x1={0} y1={pos} x2={6} y2={pos} stroke="#999" strokeWidth={1} />
            <text x={-3} y={pos + 3} fontSize={8} fill="#666" textAnchor="end" fontFamily="sans-serif">
              {depth}
            </text>
            <line x1={0} y1={pos} x2={width} y2={pos} stroke="#eee" strokeWidth={0.3} />
          </g>
        );
      })}
      <line x1={0} y1={0} x2={0} y2={height} stroke="#bbb" strokeWidth={1} />
    </g>
  );
}
