import type { DiagramConfig, Perforation } from '../../types';
import { diameterToX } from '../../hooks/use-diagram-config';
import { useTooltip } from '../tooltip-context';

interface Props {
  perforations: Perforation[];
  minCasingDiameter: number;
  config: DiagramConfig;
}

export default function PerforationLayer({ perforations, minCasingDiameter, config }: Props) {
  const { show, move, hide } = useTooltip();
  const { x1, x2 } = diameterToX(config, minCasingDiameter);

  const outerLen     = config.pulgada * 0.9;  // how far lines extend into formation
  const innerOverlap = config.pulgada * 0.2;  // how far lines overlap into casing space

  return (
    <g className="layer-perforations">
      {perforations.map((perf) => {
        const yTop = config.depthToPos(perf.top);
        const yBase = config.depthToPos(perf.base);
        const intervalH = yBase - yTop;
        const isShoot = perf.type === 'shoot';

        // Density proportional to pulgada
        const minSpacing = Math.max(config.pulgada * 0.5, 6);
        const numShots = Math.max(3, Math.floor(intervalH / minSpacing));
        const spacing = intervalH / (numShots + 1);

        const lineColor   = isShoot ? '#333' : '#1a4a8B';
        const borderColor = isShoot ? '#555' : '#2a7bc0';
        const strokeW     = isShoot ? 1.0 : 1.8;

        const info = [
          `Tipo: ${isShoot ? 'Cañoneo' : 'Ranurado'}`,
          `Tope: ${perf.top} ft`,
          `Base: ${perf.base} ft`,
        ];

        const lines = [];
        for (let i = 1; i <= numShots; i++) {
          const y = yTop + spacing * i;

          const half = config.halfSection;
          const showLeft = !half || config.halfSide === 'left';
          const showRight = !half || config.halfSide === 'right';

          if (isShoot) {
            lines.push(
              <g key={`${perf.id}-line-${i}`}>
                {showLeft && (
                  <line
                    x1={x1 - outerLen} y1={y}
                    x2={x1 + innerOverlap} y2={y}
                    stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round"
                  />
                )}
                {showRight && (
                  <line
                    x1={x2 - innerOverlap} y1={y}
                    x2={x2 + outerLen} y2={y}
                    stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round"
                  />
                )}
              </g>
            );
          } else {
            const slotLen = config.pulgada * 0.45;
            lines.push(
              <g key={`${perf.id}-slot-${i}`}>
                {showLeft && (
                  <line
                    x1={x1 - slotLen} y1={y}
                    x2={x1 + slotLen * 0.25} y2={y}
                    stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round"
                  />
                )}
                {showRight && (
                  <line
                    x1={x2 - slotLen * 0.25} y1={y}
                    x2={x2 + slotLen} y2={y}
                    stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round"
                  />
                )}
              </g>
            );
          }
        }

        return (
          <g key={perf.id}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <line x1={x1 - outerLen} y1={yTop}  x2={x2 + outerLen} y2={yTop}
              stroke={borderColor} strokeWidth={0.6} strokeDasharray="3,2" />
            <line x1={x1 - outerLen} y1={yBase} x2={x2 + outerLen} y2={yBase}
              stroke={borderColor} strokeWidth={0.6} strokeDasharray="3,2" />
            {lines}
          </g>
        );
      })}
    </g>
  );
}
