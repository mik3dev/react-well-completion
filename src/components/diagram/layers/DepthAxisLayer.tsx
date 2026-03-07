import type { DiagramConfig } from '../../../types';

interface Props {
  config: DiagramConfig;
}

export default function DepthAxisLayer({ config }: Props) {
  const { maxDepth, pxPerFt, width } = config;

  // Calculate a nice tick interval
  const rawInterval = maxDepth / 10;
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
    <g className="layer-depth-axis">
      {ticks.map(depth => {
        const y = depth * pxPerFt;
        return (
          <g key={depth}>
            <line x1={0} y1={y} x2={8} y2={y} stroke="#999" strokeWidth={1} />
            <text x={-4} y={y + 3} fontSize={9} fill="#666" textAnchor="end">
              {depth}
            </text>
            <line x1={0} y1={y} x2={width} y2={y} stroke="#eee" strokeWidth={0.5} />
          </g>
        );
      })}
      {/* Axis line */}
      <line x1={0} y1={0} x2={0} y2={maxDepth * pxPerFt} stroke="#ccc" strokeWidth={1} />
    </g>
  );
}
