import type { DiagramConfig } from 'react-well-completion';

interface Props {
  config: DiagramConfig;
}

export default function DepthAxisLayer({ config }: Props) {
  const { maxDepth, height, width, depthToPos, orientation } = config;
  const isH = orientation === 'horizontal';

  // Calculate a nice tick interval
  const rawInterval = maxDepth / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
  const normalized = rawInterval / magnitude;
  let interval: number;
  if (normalized <= 1) interval = magnitude;
  else if (normalized <= 2) interval = 2 * magnitude;
  else if (normalized <= 5) interval = 5 * magnitude;
  else interval = 10 * magnitude;

  // In horizontal mode, use larger intervals to prevent label overlap
  if (isH) {
    const minTickSpacing = 50; // minimum pixels between ticks after rotation
    while (depthToPos(interval) < minTickSpacing && interval < maxDepth) {
      interval *= 2;
    }
  }

  const ticks: number[] = [];
  for (let d = interval; d <= maxDepth; d += interval) {
    ticks.push(d);
  }

  return (
    <g className="layer-depth-axis">
      {ticks.map(depth => {
        const pos = depthToPos(depth);
        return (
          <g key={depth}>
            <line x1={0} y1={pos} x2={8} y2={pos} stroke="#999" strokeWidth={1} />
            <text
              x={-4} y={pos + 3}
              fontSize={9} fill="#666" textAnchor="end"
            >
              {depth}
            </text>
            <line x1={0} y1={pos} x2={width} y2={pos} stroke="#eee" strokeWidth={0.5} />
          </g>
        );
      })}
      {/* Axis line */}
      <line x1={0} y1={0} x2={0} y2={height} stroke="#ccc" strokeWidth={1} />
    </g>
  );
}
