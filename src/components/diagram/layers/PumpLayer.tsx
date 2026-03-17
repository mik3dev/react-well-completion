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

  const fullPumpW = pump.diameter * config.pulgada;
  const pumpWidth = config.halfSection ? fullPumpW / 2 : fullPumpW;
  const x = config.halfSection
    ? (config.halfSide === 'right' ? config.centerLine : config.centerLine - pumpWidth)
    : config.centerLine - fullPumpW / 2;
  const y = config.depthToPos(pump.depth);
  // Altura: escala real si hay longitud, mínimo visual de 20px para que no sea invisible
  const MIN_PUMP_H = 20;
  const scaledH = pump.length > 0
    ? config.depthToPos(pump.depth + pump.length) - y
    : 0;
  const pumpHeight = Math.max(scaledH, MIN_PUMP_H);

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
        <BmPumpIcon x={x} y={y} width={pumpWidth} height={pumpHeight} />
      )}
      {pump.type === 'BCP' && (
        <BcpPumpIcon x={x} y={y} width={pumpWidth} height={pumpHeight} />
      )}
      {pump.type === 'BES' && (
        <BesPumpIcon x={x} y={y} width={pumpWidth} height={pumpHeight} />
      )}
      {/* Transparent hover target */}
      <rect x={x} y={y} width={pumpWidth} height={pumpHeight} fill="transparent" />
    </g>
  );
}
