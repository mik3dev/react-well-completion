/** Manga deslizable / Sliding Sleeve */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SleeveIcon({ x, y, width, height }: Props) {
  const strokeW = Math.max(0.8, width * 0.04);

  return (
    <g>
      {/* Outer body */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#6d4c41" stroke="#4e342e" strokeWidth={strokeW} rx={1}
      />

      {/* Sliding port opening */}
      <rect
        x={x + width * 0.2} y={y + height * 0.15}
        width={width * 0.6} height={height * 0.7}
        fill="#8d6e63" stroke="#5d4037" strokeWidth={strokeW * 0.5} rx={1}
      />

      {/* Port slots */}
      {[0.3, 0.5, 0.7].map(pct => (
        <rect key={pct}
          x={x + width * 0.3} y={y + height * pct - height * 0.04}
          width={width * 0.4} height={height * 0.08}
          fill="#4e342e" rx={1}
        />
      ))}

      {/* Shift profile (shoulders) */}
      <line x1={x} y1={y + height * 0.05} x2={x + width} y2={y + height * 0.05}
        stroke="#3e2723" strokeWidth={strokeW * 0.8} />
      <line x1={x} y1={y + height * 0.95} x2={x + width} y2={y + height * 0.95}
        stroke="#3e2723" strokeWidth={strokeW * 0.8} />
    </g>
  );
}
