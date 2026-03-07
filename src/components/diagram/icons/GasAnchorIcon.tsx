/** Ancla de Gas — separador de gas con perforaciones radiales */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function GasAnchorIcon({ x, y, width, height }: Props) {
  const cx = x + width / 2;
  const strokeW = Math.max(0.8, width * 0.04);

  // Perforations pattern
  const rows = Math.max(3, Math.floor(height / 8));
  const rowSpacing = height * 0.8 / rows;

  return (
    <g>
      {/* Outer tube */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#78909c" stroke="#455a64" strokeWidth={strokeW} rx={2}
      />

      {/* Inner dip tube */}
      <rect
        x={cx - width * 0.12} y={y + height * 0.05}
        width={width * 0.24} height={height * 0.85}
        fill="#546e7a" stroke="#37474f" strokeWidth={strokeW * 0.5}
      />

      {/* Perforation holes (left and right) */}
      {Array.from({ length: rows }, (_, i) => {
        const cy = y + height * 0.1 + i * rowSpacing;
        return (
          <g key={i}>
            <circle cx={x + width * 0.18} cy={cy} r={width * 0.06}
              fill="#455a64" stroke="#263238" strokeWidth={strokeW * 0.3} />
            <circle cx={x + width * 0.82} cy={cy} r={width * 0.06}
              fill="#455a64" stroke="#263238" strokeWidth={strokeW * 0.3} />
          </g>
        );
      })}

      {/* Top cap */}
      <rect
        x={x - width * 0.05} y={y} width={width * 1.1} height={height * 0.06}
        fill="#455a64" stroke="#263238" strokeWidth={strokeW * 0.5} rx={1}
      />

      {/* Bottom shoe */}
      <polygon
        points={`${x},${y + height} ${x + width},${y + height} ${cx},${y + height + height * 0.06}`}
        fill="#455a64" stroke="#263238" strokeWidth={strokeW * 0.5}
      />
    </g>
  );
}
