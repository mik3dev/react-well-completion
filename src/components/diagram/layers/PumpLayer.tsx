import type { DiagramConfig, Pump } from '../../../types';
import { useTooltip } from '../Tooltip';
import { BmPumpIcon, BcpPumpIcon, BesPumpIcon } from '../icons';

interface Props {
  pump: Pump | null;
  config: DiagramConfig;
}

export default function PumpLayer({ pump, config }: Props) {
  const { show, move, hide } = useTooltip();
  if (!pump) return null;

  const pumpWidth = pump.diameter * config.pulgada;
  const x = config.centerX - pumpWidth / 2;
  const y = config.depthToY(pump.depth);
  // Height proportional to width (aspect ratio ~2.5:1 for BM/BCP, ~3:1 for BES)
  const minH = pump.type === 'BES' ? pumpWidth * 3 : pumpWidth * 2.5;
  const scaledH = pump.length > 0
    ? config.depthToY(pump.depth + pump.length) - y
    : 0;
  const pumpHeight = Math.max(scaledH, minH);

  const labels: Record<string, string> = {
    BM: 'Bomba Mecánica',
    BCP: 'Bomba Cavidades Progresivas',
    BES: 'Bomba Electrosumergible',
    GL: 'Gas Lift',
  };

  const info = [
    `Tipo: ${labels[pump.type] || pump.type}`,
    `Profundidad: ${pump.depth} ft`,
    `Diámetro: ${pump.diameter}"`,
    pump.length > 0 ? `Longitud: ${pump.length} ft` : '',
  ].filter(Boolean);

  return (
    <g className="layer-pump"
      onMouseEnter={e => show(e, info)}
      onMouseMove={move}
      onMouseLeave={hide}
    >
      {pump.type === 'BM' && (
        <BmPumpIcon x={x} y={y - pumpHeight} width={pumpWidth} height={pumpHeight} />
      )}
      {pump.type === 'BCP' && (
        <BcpPumpIcon x={x} y={y - pumpHeight} width={pumpWidth} height={pumpHeight} />
      )}
      {pump.type === 'BES' && (
        <BesPumpIcon x={x} y={y - pumpHeight} width={pumpWidth} height={pumpHeight} />
      )}
      {/* Transparent hover target */}
      <rect x={x} y={y - pumpHeight} width={pumpWidth} height={pumpHeight} fill="transparent" />
    </g>
  );
}
