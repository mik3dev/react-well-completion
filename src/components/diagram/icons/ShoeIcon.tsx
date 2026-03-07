/** Zapata de casing — guide shoe / float shoe */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'left' | 'right';
}

export default function ShoeIcon({ x, y, width, height, side }: Props) {
  const strokeW = Math.max(0.8, width * 0.08);

  // The shoe tapers inward at the bottom
  if (side === 'left') {
    return (
      <g>
        <polygon
          points={`
            ${x},${y}
            ${x + width},${y}
            ${x + width},${y + height * 0.4}
            ${x + width * 0.6},${y + height}
            ${x},${y + height * 0.7}
          `}
          fill="#333" stroke="#111" strokeWidth={strokeW}
        />
        {/* Cement channel */}
        <circle cx={x + width * 0.5} cy={y + height * 0.35} r={width * 0.15}
          fill="#666" stroke="#444" strokeWidth={strokeW * 0.4} />
      </g>
    );
  }

  return (
    <g>
      <polygon
        points={`
          ${x},${y}
          ${x + width},${y}
          ${x + width},${y + height * 0.7}
          ${x + width * 0.4},${y + height}
          ${x},${y + height * 0.4}
        `}
        fill="#333" stroke="#111" strokeWidth={strokeW}
      />
      <circle cx={x + width * 0.5} cy={y + height * 0.35} r={width * 0.15}
        fill="#666" stroke="#444" strokeWidth={strokeW * 0.4} />
    </g>
  );
}
