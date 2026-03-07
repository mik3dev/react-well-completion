/** Empacadura — anillos de sello entre tubing y casing */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'left' | 'right';
}

export default function PackingIcon({ x, y, width, height, side }: Props) {
  const strokeW = Math.max(0.8, width * 0.05);
  const rings = 3;
  const ringH = height / (rings + 1);

  return (
    <g>
      {/* Base block */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#4e342e" stroke="#3e2723" strokeWidth={strokeW} rx={1}
      />

      {/* Rubber seal rings */}
      {Array.from({ length: rings }, (_, i) => {
        const ry = y + ringH * (i + 0.5);
        const bulge = side === 'left' ? -width * 0.15 : width * 0.15;
        return (
          <ellipse key={i}
            cx={x + width / 2 + bulge} cy={ry}
            rx={width * 0.4} ry={ringH * 0.3}
            fill="#795548" stroke="#5d4037" strokeWidth={strokeW * 0.6}
          />
        );
      })}

      {/* Metal backup rings */}
      <line x1={x} y1={y + height * 0.1} x2={x + width} y2={y + height * 0.1}
        stroke="#9e9e9e" strokeWidth={strokeW * 0.8} />
      <line x1={x} y1={y + height * 0.9} x2={x + width} y2={y + height * 0.9}
        stroke="#9e9e9e" strokeWidth={strokeW * 0.8} />
    </g>
  );
}
