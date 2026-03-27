/** Bomba Mecánica — pistón con válvula de pie y travelling valve */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function BmPumpIcon({ x, y, width, height }: Props) {
  const cx = x + width / 2;
  const strokeW = Math.max(1, width * 0.04);

  return (
    <g>
      {/* Barrel body */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#e0e0e0" stroke="#333" strokeWidth={strokeW} rx={2}
      />

      {/* Inner cylinder bore */}
      <rect
        x={x + width * 0.15} y={y + height * 0.05}
        width={width * 0.7} height={height * 0.9}
        fill="#f5f5f5" stroke="#666" strokeWidth={strokeW * 0.6} rx={1}
      />

      {/* Plunger (piston) */}
      <rect
        x={x + width * 0.2} y={y + height * 0.15}
        width={width * 0.6} height={height * 0.12}
        fill="#d32f2f" stroke="#b71c1c" strokeWidth={strokeW * 0.8} rx={1}
      />

      {/* Travelling valve (V shape on plunger) */}
      <path
        d={`M${cx - width * 0.15},${y + height * 0.18} L${cx},${y + height * 0.24} L${cx + width * 0.15},${y + height * 0.18}`}
        stroke="white" strokeWidth={strokeW * 0.7} fill="none"
      />

      {/* Standing valve (at bottom) */}
      <line
        x1={x + width * 0.25} y1={y + height * 0.82}
        x2={x + width * 0.75} y2={y + height * 0.82}
        stroke="#333" strokeWidth={strokeW * 1.2}
      />
      <path
        d={`M${cx - width * 0.12},${y + height * 0.82} L${cx},${y + height * 0.88} L${cx + width * 0.12},${y + height * 0.82}`}
        stroke="#333" strokeWidth={strokeW * 0.7} fill="none"
      />

      {/* Rod connection (top) */}
      <rect
        x={cx - width * 0.08} y={y - height * 0.02}
        width={width * 0.16} height={height * 0.19}
        fill="#9e9e9e" stroke="#333" strokeWidth={strokeW * 0.5}
      />

      {/* Horizontal bars (barrel rings) */}
      {[0.35, 0.5, 0.65].map(pct => (
        <line key={pct}
          x1={x + width * 0.1} y1={y + height * pct}
          x2={x + width * 0.9} y2={y + height * pct}
          stroke="#bbb" strokeWidth={strokeW * 0.4}
        />
      ))}
    </g>
  );
}
