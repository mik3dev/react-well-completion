import type { DiagramConfig, Pump } from 'react-well-completion';

interface Props {
  pump: Pump | null;
  config: DiagramConfig;
}

export default function SimplifiedPumpLayer({ pump, config }: Props) {
  if (!pump) return null;

  const pumpW = pump.diameter * config.pulgada;
  const x = config.centerX - pumpW / 2;
  const y = config.depthToPos(pump.depth);
  const scaledH = pump.length > 0
    ? config.depthToPos(pump.depth + pump.length) - y
    : 0;
  const pumpH = Math.max(scaledH, 16);

  return (
    <rect
      x={x} y={y}
      width={pumpW} height={pumpH}
      fill="#333" stroke="#111" strokeWidth={0.5}
    />
  );
}
