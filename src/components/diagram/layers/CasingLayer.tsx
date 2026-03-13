import type { DiagramConfig, Casing } from '../../../types';
import { diameterToX } from '../../../hooks/use-diagram-config';
import { useTooltip } from '../Tooltip';
import { ShoeIcon, HangerIcon } from '../icons';

interface Props {
  casings: Casing[];
  config: DiagramConfig;
}

function fmtDiameter(value: number): string {
  const whole = Math.floor(value);
  const eighths = Math.round((value - whole) * 8);
  if (eighths === 0) return `${whole}`;
  if (eighths === 8) return `${whole + 1}`;
  const frac: Record<number, string> = { 1: '1/8', 2: '1/4', 3: '3/8', 4: '1/2', 5: '5/8', 6: '3/4', 7: '7/8' };
  return whole > 0 ? `${whole}-${frac[eighths]}` : frac[eighths];
}

function buildLabel(c: Casing): string {
  const d = fmtDiameter(c.diameter);
  const weightPart = c.weight != null ? ` #${c.weight}` : '';
  const gradePart = c.grade ? ` ${c.grade}` : '';
  return `Rev. ${d}"${weightPart}${gradePart} a ${c.base}'`;
}

export default function CasingLayer({ casings, config }: Props) {
  const { show, move, hide } = useTooltip();
  const WALL = 5;
  const shoeH = WALL * 2;        // 10px — altura vertical de la zapata
  const shoeW = WALL * 3;        // 15px — extensión horizontal hacia afuera
  const hangerH = WALL * 4;      // 20px — espacio reservado (offset de pared del liner)
  const hangerBlockH = WALL;     // 5px  — altura del bloque del colgador (delgado)

  const sorted = [...casings].sort((a, b) => b.diameter - a.diameter);

  return (
    <g className="layer-casings">
      {sorted.map((casing, idx) => {
        const { x1, x2 } = diameterToX(config, casing.diameter);
        const y = config.depthToY(casing.top);
        const h = config.depthToY(casing.base) - y;
        const label = casing.isLiner ? 'Liner' : 'Casing';
        const hasHanger = casing.top > 0;

        const info = [
          `Tipo: ${label}`,
          `Tope: ${casing.top} ft`,
          `Base: ${casing.base} ft`,
          `Diámetro: ${casing.diameter}"`,
        ];

        // Conector horizontal de escalonamiento: solo para casings sin colgador
        const prev = idx > 0 ? sorted[idx - 1] : null;
        let connector = null;
        if (prev && prev.diameter > casing.diameter && !hasHanger) {
          const { x1: px1, x2: px2 } = diameterToX(config, prev.diameter);
          connector = (
            <g>
              <line x1={px1} y1={y} x2={x1} y2={y} stroke="black" strokeWidth={2} />
              <line x1={x2} y1={y} x2={px2} y2={y} stroke="black" strokeWidth={2} />
            </g>
          );
        }

        // Pared del liner: empieza hangerH px más abajo para dejar espacio al colgador
        const wallY = y + (hasHanger ? hangerH : 0);
        const wallH = h - (hasHanger ? hangerH : 0);

        // earW del colgador: se calcula dinámicamente para llegar exactamente desde
        // la cara interior del casing padre hasta la cara exterior del liner.
        // Esto asegura que el bloque visible "cruce" el espacio anular entre casings.
        let earW = WALL; // fallback
        if (hasHanger) {
          const parent = sorted.find(
            c => c !== casing &&
                 c.diameter > casing.diameter &&
                 c.top <= casing.top &&
                 c.base >= casing.top
          );
          if (parent) {
            const { x1: px1 } = diameterToX(config, parent.diameter);
            // gap = distancia entre cara interior del padre y cara exterior del liner
            // earW hace que el bloque empiece en la cara interior del padre
            earW = Math.max(x1 - px1 - WALL, WALL / 2);
          }
        }

        const labelY = wallY + wallH * 0.12;
        const inlineLabel = buildLabel(casing);

        return (
          <g key={casing.id}>
            {connector}

            {/* Colgador: bloque delgado que cruza todo el espacio anular entre casings */}
            {hasHanger && (
              <HangerIcon
                x1={x1} x2={x2} y={y + (hangerH - hangerBlockH) / 2}
                earW={earW} wall={WALL} h={hangerBlockH}
              />
            )}

            {/* Pared izquierda */}
            <rect
              x={x1 - WALL / 2} y={wallY} width={WALL} height={wallH}
              fill="url(#casingHatch)" stroke="black" strokeWidth={1}
              onMouseEnter={e => show(e, info)}
              onMouseMove={move}
              onMouseLeave={hide}
            />
            {/* Pared derecha */}
            <rect
              x={x2 - WALL / 2} y={wallY} width={WALL} height={wallH}
              fill="url(#casingHatch)" stroke="black" strokeWidth={1}
              onMouseEnter={e => show(e, info)}
              onMouseMove={move}
              onMouseLeave={hide}
            />

            {/* Zapatas */}
            <ShoeIcon x={x1 - WALL / 2} y={y + h - shoeH} width={shoeW} height={shoeH} side="left" />
            <ShoeIcon x={x2 + WALL / 2} y={y + h - shoeH} width={shoeW} height={shoeH} side="right" />

            {/* Label inline */}
            <text
              x={x1 - WALL / 2 - 3}
              y={labelY}
              fontSize={7}
              textAnchor="end"
              fill="#333"
              fontFamily="monospace"
            >
              {inlineLabel}
            </text>
          </g>
        );
      })}
    </g>
  );
}
