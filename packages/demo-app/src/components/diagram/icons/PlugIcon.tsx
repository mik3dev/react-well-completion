/** Tapón ciego — bloqueo total del paso */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PlugIcon({ x, y, width, height }: Props) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const strokeW = Math.max(0.8, width * 0.03);

  return (
    <g>
      {/* Body */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#37474f" stroke="#263238" strokeWidth={strokeW} rx={2}
      />

      {/* Cross hatch (indicates blockage) */}
      <line x1={x + width * 0.15} y1={y + height * 0.15}
        x2={x + width * 0.85} y2={y + height * 0.85}
        stroke="#b0bec5" strokeWidth={strokeW * 1.2} />
      <line x1={x + width * 0.85} y1={y + height * 0.15}
        x2={x + width * 0.15} y2={y + height * 0.85}
        stroke="#b0bec5" strokeWidth={strokeW * 1.2} />

      {/* Center bolt */}
      <circle cx={cx} cy={cy} r={Math.min(width, height) * 0.15}
        fill="#546e7a" stroke="#263238" strokeWidth={strokeW * 0.8} />
    </g>
  );
}
