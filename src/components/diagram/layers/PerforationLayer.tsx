import type { DiagramConfig, Perforation } from '../../../types';
import { diameterToX } from '../../../hooks/use-diagram-config';
import { useTooltip } from '../Tooltip';

interface Props {
  perforations: Perforation[];
  minCasingDiameter: number;
  config: DiagramConfig;
}

export default function PerforationLayer({ perforations, minCasingDiameter, config }: Props) {
  const { show, move, hide } = useTooltip();
  const { x1, x2 } = diameterToX(config, minCasingDiameter);
  const arrowLen = config.pulgada * 0.8;

  return (
    <g className="layer-perforations">
      {perforations.map((perf) => {
        const yTop = perf.top * config.pxPerFt;
        const yBase = perf.base * config.pxPerFt;
        const numArrows = Math.max(2, Math.floor((yBase - yTop) / 12));
        const spacing = (yBase - yTop) / (numArrows + 1);

        const info = [
          `Tipo: ${perf.type === 'shoot' ? 'Cañoneo' : 'Ranurado'}`,
          `Tope: ${perf.top} ft`,
          `Base: ${perf.base} ft`,
        ];

        if (perf.type === 'shoot') {
          // Arrows pointing outward
          const arrows = [];
          for (let i = 1; i <= numArrows; i++) {
            const y = yTop + spacing * i;
            arrows.push(
              <g key={`${perf.id}-arrow-${i}`}>
                {/* Left arrow (pointing left) */}
                <line x1={x1} y1={y} x2={x1 - arrowLen} y2={y}
                  stroke="black" strokeWidth={1.5} markerEnd="url(#arrowLeft)" />
                {/* Right arrow (pointing right) */}
                <line x1={x2} y1={y} x2={x2 + arrowLen} y2={y}
                  stroke="black" strokeWidth={1.5} markerEnd="url(#arrowRight)" />
              </g>
            );
          }
          return (
            <g key={perf.id}
              onMouseEnter={e => show(e, info)}
              onMouseMove={move}
              onMouseLeave={hide}
            >
              {arrows}
            </g>
          );
        }

        // Slot: horizontal dashes
        const slots = [];
        for (let i = 1; i <= numArrows; i++) {
          const y = yTop + spacing * i;
          slots.push(
            <g key={`${perf.id}-slot-${i}`}>
              <line x1={x1 - 3} y1={y} x2={x1 + 3} y2={y}
                stroke="black" strokeWidth={2} />
              <line x1={x2 - 3} y1={y} x2={x2 + 3} y2={y}
                stroke="black" strokeWidth={2} />
            </g>
          );
        }
        return (
          <g key={perf.id}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            {slots}
          </g>
        );
      })}
    </g>
  );
}
