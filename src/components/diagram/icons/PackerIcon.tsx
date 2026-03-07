/** Packer — cuñas expandidas contra el casing con elementos de sello */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'left' | 'right';
}

export default function PackerIcon({ x, y, width, height, side }: Props) {
  const strokeW = Math.max(0.8, width * 0.05);
  const dir = side === 'left' ? 1 : -1;

  // Chevron slips pattern pointing outward
  const slipCount = 3;
  const slipH = height / (slipCount + 1);

  return (
    <g>
      {/* Main body */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#424242" stroke="#212121" strokeWidth={strokeW} rx={1}
      />

      {/* Rubber sealing elements (horizontal stripes) */}
      {[0.15, 0.5, 0.85].map(pct => (
        <rect key={pct}
          x={x + width * 0.05} y={y + height * pct - height * 0.06}
          width={width * 0.9} height={height * 0.12}
          fill="#616161" stroke="#9e9e9e" strokeWidth={strokeW * 0.4} rx={1}
        />
      ))}

      {/* Slips / cuñas (chevrons pointing outward) */}
      {Array.from({ length: slipCount }, (_, i) => {
        const cy = y + slipH * (i + 0.5);
        const tipX = side === 'left' ? x : x + width;
        const baseX = side === 'left' ? x + width * 0.6 : x + width * 0.4;
        return (
          <polygon key={i}
            points={`${tipX},${cy} ${baseX},${cy - slipH * 0.2} ${baseX},${cy + slipH * 0.2}`}
            fill="#ff5722" stroke="#bf360c" strokeWidth={strokeW * 0.5}
            transform={`translate(${dir * width * 0.1}, 0)`}
          />
        );
      })}
    </g>
  );
}
