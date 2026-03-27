import type { DiagramConfig, Wire, TubingSegment } from 'react-well-completion';
import { diameterToX } from 'react-well-completion';
import { useTooltip } from '../Tooltip';
import { WireIcon } from '../icons';

interface Props {
  wire: Wire | null;
  tubingString: TubingSegment[];
  config: DiagramConfig;
}

export default function WireLayer({ wire, tubingString, config }: Props) {
  const { show, move, hide } = useTooltip();
  if (!wire || tubingString.length === 0) return null;

  // Wire is on the left side of tubing — hide if half-section right only
  if (config.halfSection && config.halfSide === 'right') return null;

  const firstTubDiam = tubingString[0]?.diameter || 4;
  const { x1 } = diameterToX(config, firstTubDiam);
  const wireWidth = config.pulgada * 0.35;
  const wireX = x1 - wireWidth - 3;
  const wireH = config.depthToPos(wire.depth);

  return (
    <g className="layer-wire"
      onMouseEnter={e => show(e, ['Tipo: Cable BES', `Profundidad: ${wire.depth} ft`])}
      onMouseMove={move}
      onMouseLeave={hide}
    >
      <WireIcon x={wireX} y={0} width={wireWidth} height={wireH} />
      {/* Transparent hover target */}
      <rect x={wireX} y={0} width={wireWidth} height={wireH} fill="transparent" />
    </g>
  );
}
