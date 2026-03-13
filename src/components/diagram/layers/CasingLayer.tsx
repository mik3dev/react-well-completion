import type { DiagramConfig, Casing } from '../../../types';
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

/**
 * Calcula posiciones esquemáticas para los casings de ADENTRO HACIA AFUERA.
 * El casing más interno (liner de producción) usa su posición proporcional real,
 * preservando el espacio con el tubing. Los casings exteriores se expanden hacia
 * afuera cuando la diferencia de diámetro real es insuficiente para el gap mínimo.
 */
function computeSchematicPositions(
  sorted: Casing[],    // sorted[0] = mayor diámetro (exterior)
  config: DiagramConfig,
  WALL: number,
  MIN_GAP: number,
): { x1: number; x2: number }[] {
  const n = sorted.length;
  const x1s = new Array<number>(n);

  // Partir del más interno (último en sorted) con posición natural
  x1s[n - 1] = config.centerX - (sorted[n - 1].diameter / 2) * config.pulgada;

  // Trabajar hacia afuera: cada casing exterior debe estar al menos WALL+MIN_GAP
  // a la IZQUIERDA del siguiente casing interior
  for (let i = n - 2; i >= 0; i--) {
    const naturalX1 = config.centerX - (sorted[i].diameter / 2) * config.pulgada;
    const maxX1 = x1s[i + 1] - WALL - MIN_GAP; // no puede solaparse con el interior
    x1s[i] = Math.min(naturalX1, maxX1);         // tomar el más a la izquierda
  }

  return x1s.map(x1 => ({ x1, x2: config.centerX * 2 - x1 }));
}

export default function CasingLayer({ casings, config }: Props) {
  const { show, move, hide } = useTooltip();
  const WALL = 5;
  const MIN_CASING_GAP = 12;    // px mínimos entre paredes de casings adyacentes
  const shoeH = WALL * 2;       // 10px
  const shoeW = WALL * 3;       // 15px
  const hangerH = WALL * 4;     // 20px — espacio total reservado para el colgador
  const hangerBlockH = WALL;    //  5px — altura del bloque del colgador

  const sorted = [...casings].sort((a, b) => b.diameter - a.diameter);

  // Posiciones esquemáticas: gap mínimo garantizado entre casings adyacentes
  const positions = computeSchematicPositions(sorted, config, WALL, MIN_CASING_GAP);

  return (
    <g className="layer-casings">
      {sorted.map((casing, idx) => {
        const { x1, x2 } = positions[idx];
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

        // Pared del liner empieza hangerH px abajo para dejar espacio visible al colgador
        const wallY = y + (hasHanger ? hangerH : 0);
        const wallH = h - (hasHanger ? hangerH : 0);

        // earW del colgador: cruza todo el gap entre el casing padre y este liner.
        // Con posiciones esquemáticas el gap siempre es >= MIN_CASING_GAP.
        let earW = MIN_CASING_GAP; // default: gap mínimo garantizado
        if (hasHanger && idx > 0) {
          // Buscar el índice del casing padre (el más cercano que lo contenga)
          let parentIdx = -1;
          for (let i = idx - 1; i >= 0; i--) {
            const c = sorted[i];
            if (c.diameter > casing.diameter && c.top <= casing.top && c.base >= casing.top) {
              parentIdx = i;
              break;
            }
          }
          if (parentIdx >= 0) {
            const parentX1 = positions[parentIdx].x1;
            // Gap real entre cara interior del padre y cara exterior de este liner
            earW = Math.max(x1 - parentX1 - WALL, WALL / 2);
          }
        }

        const labelY = wallY + wallH * 0.12;
        const inlineLabel = buildLabel(casing);

        return (
          <g key={casing.id}>
            {connector}

            {/* Colgador: bloque centrado en el espacio hangerH */}
            {hasHanger && (
              <HangerIcon
                x1={x1} x2={x2}
                y={y + hangerH - hangerBlockH}
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
