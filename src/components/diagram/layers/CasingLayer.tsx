import type { DiagramConfig, Casing } from '../../../types';
import { computeCasingPositions } from '../../../hooks/use-diagram-config';
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
  const MIN_CASING_GAP = 12;
  const shoeH = WALL * 2;
  const shoeW = WALL * 3;
  const hangerH = WALL * 4;
  const hangerBlockH = WALL;

  const sorted = [...casings].sort((a, b) => b.diameter - a.diameter);

  // Posiciones esquemáticas compartidas (misma lógica que AccessoriesLayer)
  const posMap = computeCasingPositions(casings, config);
  const positions = sorted.map(c => posMap.get(c.id)!);

  return (
    <g className="layer-casings">
      {sorted.map((casing, idx) => {
        const { x1, x2 } = positions[idx];
        const y = config.depthToPos(casing.top);
        const h = config.depthToPos(casing.base) - y;
        const label = casing.isLiner ? 'Liner' : 'Casing';
        const hasHanger = casing.isLiner && casing.top > 0;

        const info = [
          `Tipo: ${label}`,
          `Tope: ${casing.top} ft`,
          `Base: ${casing.base} ft`,
          `Diámetro: ${casing.diameter}"`,
        ];

        // Buscar casing padre (el más cercano que contenga el tope de este casing)
        let parentIdx = -1;
        if (idx > 0) {
          for (let i = idx - 1; i >= 0; i--) {
            const c = sorted[i];
            if (c.diameter > casing.diameter && c.top <= casing.top && c.base >= casing.top) {
              parentIdx = i;
              break;
            }
          }
        }

        // Conector horizontal para casings sin colgador (reducción de diámetro sin liner)
        const prev = idx > 0 ? sorted[idx - 1] : null;
        let connector = null;
        if (prev && prev.diameter > casing.diameter && !hasHanger) {
          const { x1: px1, x2: px2 } = positions[idx - 1];
          connector = (
            <g>
              <line x1={px1} y1={y} x2={x1} y2={y} stroke="black" strokeWidth={2} />
              <line x1={x2} y1={y} x2={px2} y2={y} stroke="black" strokeWidth={2} />
            </g>
          );
        }

        // hangerGap dinámico: limitado al solapamiento real con el padre en px
        let hangerGap = 0;
        if (hasHanger && parentIdx >= 0) {
          const overlapPx = config.depthToPos(sorted[parentIdx].base) - y;
          hangerGap = Math.min(hangerH, Math.max(overlapPx, hangerBlockH));
        }

        const wallY = y + hangerGap;
        const wallH = h - hangerGap;

        // earW del colgador: cruza todo el gap entre el casing padre y este liner
        let earW = MIN_CASING_GAP;
        if (hasHanger && parentIdx >= 0) {
          const parentX1 = positions[parentIdx].x1;
          earW = Math.max(x1 - parentX1 - WALL, WALL / 2);
        }

        const labelY = wallY + wallH * 0.12;
        const inlineLabel = buildLabel(casing);

        return (
          <g key={casing.id}>
            {connector}

            {/* Colgador: bloque al fondo del gap, tocando la pared del liner */}
            {hasHanger && hangerGap > 0 && (
              <HangerIcon
                x1={x1} x2={x2}
                y={y + hangerGap - hangerBlockH}
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
