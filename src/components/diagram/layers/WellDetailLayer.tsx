import type { DiagramConfig, Well, LiftMethod } from '../../../types';
import { useLabelsStore } from '../../../store/labels-store';

interface Props {
  well: Well;
  config: DiagramConfig;
}

const LIFT_LABELS: Record<LiftMethod, string> = {
  BM: 'Bomba Mecánica',
  BCP: 'BCP',
  BES: 'BES',
  GL: 'Gas Lift',
};

const BOX_W = 220;
const HEADER_H = 24;
const ROW_H = 18;
const FONT_LABEL = 8;
const FONT_VALUE = 9;

export default function WellDetailLayer({ well, config }: Props) {
  const visible = useLabelsStore(s => s.visible);
  if (!visible.wellDetail) return null;
  if (config.width < 300) return null;

  const rows: { label: string; value: string }[] = [
    { label: 'Pozo', value: well.name || '\u2014' },
    { label: 'Metodo', value: LIFT_LABELS[well.liftMethod] },
    {
      label: 'Coordenadas',
      value:
        well.latitude != null && well.longitude != null
          ? `${well.latitude.toFixed(4)}, ${well.longitude.toFixed(4)}`
          : '\u2014',
    },
    { label: 'Estacion Flujo (EF)', value: well.estacionFlujo || '\u2014' },
    {
      label: 'Mesa Rotaria (MR)',
      value: well.mesaRotaria != null ? `${well.mesaRotaria} ft` : '\u2014',
    },
    { label: 'PT', value: `${well.totalDepth}'` },
    { label: 'HUD (Prof. Libre)', value: `${well.totalFreeDepth}'` },
  ];

  const boxH = HEADER_H + rows.length * ROW_H + 1;
  const x = config.width - BOX_W - 10;
  const y = 10;

  return (
    <g className="layer-well-detail" transform={`translate(${x}, ${y})`}>
      {/* Shadow */}
      <rect
        x={2} y={2}
        width={BOX_W} height={boxH}
        fill="rgba(0,0,0,0.08)"
        rx={3}
      />

      {/* Background */}
      <rect
        width={BOX_W} height={boxH}
        fill="white"
        stroke="#333"
        strokeWidth={1.2}
        rx={3}
      />

      {/* Header */}
      <rect
        width={BOX_W} height={HEADER_H}
        fill="#2c3e50"
        rx={3}
      />
      {/* Square off bottom corners of header */}
      <rect
        y={HEADER_H - 4} width={BOX_W} height={4}
        fill="#2c3e50"
      />
      {/* Header divider accent */}
      <rect
        y={HEADER_H} width={BOX_W} height={1.5}
        fill="#e74c3c"
      />
      <text
        x={BOX_W / 2} y={HEADER_H / 2}
        fill="white"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="sans-serif"
        letterSpacing={1.5}
      >
        DETALLE DE POZO
      </text>

      {/* Rows */}
      {rows.map((row, i) => {
        const ry = HEADER_H + 1.5 + i * ROW_H;
        const isEven = i % 2 === 0;
        return (
          <g key={row.label} transform={`translate(0, ${ry})`}>
            {/* Zebra stripe */}
            {isEven && (
              <rect
                x={1} width={BOX_W - 2} height={ROW_H}
                fill="#f8f9fa"
                rx={0}
              />
            )}
            {/* Separator */}
            {i > 0 && (
              <line
                x1={8} y1={0} x2={BOX_W - 8} y2={0}
                stroke="#e9ecef"
                strokeWidth={0.5}
              />
            )}
            {/* Label */}
            <text
              x={10} y={ROW_H / 2}
              fontSize={FONT_LABEL}
              fill="#888"
              dominantBaseline="middle"
              fontFamily="sans-serif"
            >
              {row.label}
            </text>
            {/* Value */}
            <text
              x={BOX_W - 10} y={ROW_H / 2}
              fontSize={FONT_VALUE}
              fill="#222"
              fontWeight="600"
              dominantBaseline="middle"
              textAnchor="end"
              fontFamily="sans-serif"
            >
              {row.value}
            </text>
          </g>
        );
      })}

      {/* Bottom border (re-draw to cover rounded corner fill) */}
      <rect
        width={BOX_W} height={boxH}
        fill="none"
        stroke="#333"
        strokeWidth={1.2}
        rx={3}
      />
    </g>
  );
}
