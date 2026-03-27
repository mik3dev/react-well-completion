import type { DiagramConfig, Well, LiftMethod, LabelCategory } from '../../types';

interface Props {
  well: Well;
  config: DiagramConfig;
  visible: Record<LabelCategory, boolean>;
}

const LIFT_LABELS: Record<LiftMethod, string> = {
  BM: 'Bomba Mecánica',
  BCP: 'BCP',
  BES: 'BES',
  GL: 'Gas Lift',
};

const BOX_W = 280;
const HEADER_H = 24;
const ROW_H = 16;
const COL_HEADER_H = 16;
const FONT_LABEL = 8;
const FONT_VALUE = 9;
const FONT_COL = 7;
const GAP = 8;

function fmtDiameter(value: number): string {
  const whole = Math.floor(value);
  const eighths = Math.round((value - whole) * 8);
  if (eighths === 0) return `${whole}`;
  if (eighths === 8) return `${whole + 1}`;
  const frac: Record<number, string> = { 1: '1/8', 2: '1/4', 3: '3/8', 4: '1/2', 5: '5/8', 6: '3/4', 7: '7/8' };
  return whole > 0 ? `${whole}-${frac[eighths]}` : frac[eighths];
}

/* ─── DetailBlock: key-value rows (Detalle de Pozo style) ─── */

interface KVBlockProps {
  title: string;
  rows: { label: string; value: string }[];
  x: number;
  y: number;
}

function KVBlock({ title, rows, x, y }: KVBlockProps) {
  const boxH = HEADER_H + 1.5 + rows.length * ROW_H + 1;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={2} y={2} width={BOX_W} height={boxH} fill="rgba(0,0,0,0.08)" rx={3} />
      <rect width={BOX_W} height={boxH} fill="white" stroke="#333" strokeWidth={1.2} rx={3} />
      <rect width={BOX_W} height={HEADER_H} fill="#205394" rx={3} />
      <rect y={HEADER_H - 4} width={BOX_W} height={4} fill="#205394" />
      <rect y={HEADER_H} width={BOX_W} height={1.5} fill="#377AF3" />
      <text
        x={BOX_W / 2} y={HEADER_H / 2}
        fill="white" fontSize={10} fontWeight="bold"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="sans-serif" letterSpacing={1.5}
      >{title}</text>

      {rows.map((row, i) => {
        const ry = HEADER_H + 1.5 + i * ROW_H;
        return (
          <g key={row.label} transform={`translate(0, ${ry})`}>
            {i % 2 === 0 && <rect x={1} width={BOX_W - 2} height={ROW_H} fill="#f0f4fb" />}
            {i > 0 && <line x1={8} y1={0} x2={BOX_W - 8} y2={0} stroke="#e9ecef" strokeWidth={0.5} />}
            <text x={10} y={ROW_H / 2} fontSize={FONT_LABEL} fill="#888" dominantBaseline="middle" fontFamily="sans-serif">{row.label}</text>
            <text x={BOX_W - 10} y={ROW_H / 2} fontSize={FONT_VALUE} fill="#222" fontWeight="600" dominantBaseline="middle" textAnchor="end" fontFamily="sans-serif">{row.value}</text>
          </g>
        );
      })}

      <rect width={BOX_W} height={boxH} fill="none" stroke="#333" strokeWidth={1.2} rx={3} />
    </g>
  );
}

function kvBlockHeight(rowCount: number): number {
  return HEADER_H + 1.5 + rowCount * ROW_H + 1;
}

/* ─── TableBlock: columnar table (Casing / Tubing style) ─── */

interface TableBlockProps {
  title: string;
  headers: string[];
  colWidths: number[];  // fractions summing to 1
  rows: string[][];
  x: number;
  y: number;
}

function TableBlock({ title, headers, colWidths, rows, x, y }: TableBlockProps) {
  const boxH = HEADER_H + 1.5 + COL_HEADER_H + rows.length * ROW_H + 1;

  // compute absolute x offsets from fractional widths
  const colX: number[] = [];
  let acc = 0;
  for (const w of colWidths) {
    colX.push(acc * BOX_W);
    acc += w;
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={2} y={2} width={BOX_W} height={boxH} fill="rgba(0,0,0,0.08)" rx={3} />
      <rect width={BOX_W} height={boxH} fill="white" stroke="#333" strokeWidth={1.2} rx={3} />
      <rect width={BOX_W} height={HEADER_H} fill="#205394" rx={3} />
      <rect y={HEADER_H - 4} width={BOX_W} height={4} fill="#205394" />
      <rect y={HEADER_H} width={BOX_W} height={1.5} fill="#377AF3" />
      <text
        x={BOX_W / 2} y={HEADER_H / 2}
        fill="white" fontSize={10} fontWeight="bold"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="sans-serif" letterSpacing={1.5}
      >{title}</text>

      {/* Column headers */}
      <g transform={`translate(0, ${HEADER_H + 1.5})`}>
        <rect x={1} width={BOX_W - 2} height={COL_HEADER_H} fill="#e8eef8" />
        {headers.map((h, ci) => (
          <text
            key={h}
            x={colX[ci] + (colWidths[ci] * BOX_W) / 2}
            y={COL_HEADER_H / 2}
            fontSize={FONT_COL} fill="#205394" fontWeight="bold"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="sans-serif"
          >{h}</text>
        ))}
        <line x1={0} y1={COL_HEADER_H} x2={BOX_W} y2={COL_HEADER_H} stroke="#ccc" strokeWidth={0.5} />
      </g>

      {/* Data rows */}
      {rows.map((row, i) => {
        const ry = HEADER_H + 1.5 + COL_HEADER_H + i * ROW_H;
        return (
          <g key={i} transform={`translate(0, ${ry})`}>
            {i % 2 === 0 && <rect x={1} width={BOX_W - 2} height={ROW_H} fill="#f0f4fb" />}
            {i > 0 && <line x1={8} y1={0} x2={BOX_W - 8} y2={0} stroke="#e9ecef" strokeWidth={0.5} />}
            {row.map((cell, ci) => (
              <text
                key={ci}
                x={colX[ci] + (colWidths[ci] * BOX_W) / 2}
                y={ROW_H / 2}
                fontSize={FONT_VALUE} fill="#222"
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="sans-serif"
              >{cell}</text>
            ))}
          </g>
        );
      })}

      <rect width={BOX_W} height={boxH} fill="none" stroke="#333" strokeWidth={1.2} rx={3} />
    </g>
  );
}

function tableBlockHeight(rowCount: number): number {
  return HEADER_H + 1.5 + COL_HEADER_H + rowCount * ROW_H + 1;
}

/* ─── Main Component ─── */

export default function WellDetailLayer({ well, config, visible }: Props) {
  if (config.width < 300) return null;

  const x = config.width - BOX_W - 10;
  let currentY = 10;

  /* ─ Detalle de Pozo ─ */
  const wellRows: { label: string; value: string }[] = [
    { label: 'Pozo', value: well.name || '\u2014' },
    { label: 'Metodo', value: LIFT_LABELS[well.liftMethod] },
    {
      label: 'Coordenadas',
      value: well.latitude != null && well.longitude != null
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

  const showWell = visible.wellDetail;
  const wellH = showWell ? kvBlockHeight(wellRows.length) : 0;

  /* ─ Detalle de Casing ─ */
  const sortedCasings = [...well.casings].sort((a, b) => b.diameter - a.diameter);
  const showCasing = visible.casingDetail && sortedCasings.length > 0;
  const casingRows = sortedCasings.map(c => [
    `${fmtDiameter(c.diameter)}"`,
    c.weight != null ? `${c.weight}` : '\u2014',
    c.grade || '\u2014',
    `${c.top}'`,
    `${c.base}'`,
    c.isLiner ? 'Liner' : 'Casing',
  ]);
  const casingH = showCasing ? tableBlockHeight(casingRows.length) : 0;

  /* ─ Detalle de Tuberías ─ */
  const sortedTubing = [...well.tubingString].sort((a, b) => a.segment - b.segment);
  const showTubing = visible.tubingDetail && sortedTubing.length > 0;
  const tubingRows: string[][] = [];
  let cumDepth = 0;
  for (const seg of sortedTubing) {
    cumDepth += seg.length;
    tubingRows.push([
      `${seg.segment}`,
      `${fmtDiameter(seg.diameter)}"`,
      `${seg.length}'`,
      `${cumDepth}'`,
    ]);
  }
  if (well.pump) {
    tubingRows.push([
      'Bomba',
      `${fmtDiameter(well.pump.diameter)}"`,
      `${well.pump.length}'`,
      `${well.pump.depth}'`,
    ]);
  }
  if (!showWell && !showCasing && !showTubing) return null;

  // Stack positions
  const wellY = currentY;
  currentY += wellH + (showWell ? GAP : 0);
  const casingY = currentY;
  currentY += casingH + (showCasing ? GAP : 0);
  const tubingY = currentY;

  return (
    <g className="layer-well-detail">
      {showWell && (
        <KVBlock title="DETALLE DE POZO" rows={wellRows} x={x} y={wellY} />
      )}
      {showCasing && (
        <TableBlock
          title="DETALLE DE CASING"
          headers={['Ø', 'Peso', 'Grado', 'Tope', 'Base', 'Tipo']}
          colWidths={[0.17, 0.13, 0.15, 0.17, 0.17, 0.21]}
          rows={casingRows}
          x={x} y={casingY}
        />
      )}
      {showTubing && (
        <TableBlock
          title="DETALLE DE TUBERÍAS"
          headers={['Seg.', 'Ø', 'Long.', 'Prof. Acum.']}
          colWidths={[0.15, 0.25, 0.25, 0.35]}
          rows={tubingRows}
          x={x} y={tubingY}
        />
      )}
    </g>
  );
}
