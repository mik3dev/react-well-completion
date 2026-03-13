import type { DiagramConfig, Casing } from '../../../types';
import { diameterToX } from '../../../hooks/use-diagram-config';
import { useTooltip } from '../Tooltip';
import { ShoeIcon } from '../icons';

interface Props {
  casings: Casing[];
  config: DiagramConfig;
}

export default function CasingLayer({ casings, config }: Props) {
  const { show, move, hide } = useTooltip();
  const WALL = 5;

  const sorted = [...casings].sort((a, b) => b.diameter - a.diameter);

  return (
    <g className="layer-casings">
      {sorted.map((casing, idx) => {
        const { x1, x2 } = diameterToX(config, casing.diameter);
        const y = config.depthToY(casing.top);
        const h = config.depthToY(casing.base) - y;
        const label = casing.isLiner ? 'Liner' : 'Casing';
        const color = casing.isLiner ? 'gray' : 'darkgray';

        const info = [
          `Tipo: ${label}`,
          `Tope: ${casing.top} ft`,
          `Base: ${casing.base} ft`,
          `Diámetro: ${casing.diameter}"`,
        ];

        // Horizontal connection lines
        const prev = idx > 0 ? sorted[idx - 1] : null;
        let connector = null;
        if (prev && prev.diameter > casing.diameter) {
          const { x1: px1, x2: px2 } = diameterToX(config, prev.diameter);
          connector = (
            <g>
              <line x1={px1} y1={y} x2={x1} y2={y} stroke={color} strokeWidth={2} />
              <line x1={x2} y1={y} x2={px2} y2={y} stroke={color} strokeWidth={2} />
            </g>
          );
        }

        // Shoe icon at bottom
        const shoeW = WALL + 4;
        const shoeH = 10;

        return (
          <g key={casing.id}>
            {connector}
            {/* Left wall */}
            <rect
              x={x1 - WALL / 2} y={y} width={WALL} height={h}
              fill="url(#casingHatch)" stroke="black" strokeWidth={1}
              onMouseEnter={e => show(e, info)}
              onMouseMove={move}
              onMouseLeave={hide}
            />
            {/* Right wall */}
            <rect
              x={x2 - WALL / 2} y={y} width={WALL} height={h}
              fill="url(#casingHatch)" stroke="black" strokeWidth={1}
              onMouseEnter={e => show(e, info)}
              onMouseMove={move}
              onMouseLeave={hide}
            />
            {/* Shoe icons */}
            <ShoeIcon x={x1 - WALL / 2 - 1} y={y + h - 1} width={shoeW} height={shoeH} side="left" />
            <ShoeIcon x={x2 - WALL / 2 - 2} y={y + h - 1} width={shoeW} height={shoeH} side="right" />
          </g>
        );
      })}
    </g>
  );
}
