/** Niple de Asiento / Niple Pulido — restricción en el tubing */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'regular' | 'polished';
  side: 'left' | 'right';
}

export default function NippleIcon({ x, y, width, height, type, side }: Props) {
  const strokeW = Math.max(0.8, width * 0.06);
  const color = type === 'polished' ? '#1565c0' : '#e65100';
  const fillColor = type === 'polished' ? '#42a5f5' : '#ff9800';

  // Tapered profile: narrower in the middle
  const midY = y + height / 2;
  const inset = width * 0.3;
  const outerX = side === 'left' ? x : x + width;
  const innerX = side === 'left' ? x + width : x;

  return (
    <g>
      {/* Hourglass / restriction shape */}
      <polygon
        points={`
          ${outerX},${y}
          ${innerX},${y}
          ${innerX + (side === 'left' ? -inset : inset)},${midY}
          ${innerX},${y + height}
          ${outerX},${y + height}
          ${outerX + (side === 'left' ? inset : -inset)},${midY}
        `}
        fill={fillColor} stroke={color} strokeWidth={strokeW}
      />

      {/* Profile ring at restriction */}
      <line
        x1={side === 'left' ? outerX + inset * 0.5 : outerX - inset * 0.5}
        y1={midY}
        x2={side === 'left' ? innerX - inset * 0.8 : innerX + inset * 0.8}
        y2={midY}
        stroke={color} strokeWidth={strokeW * 1.5}
      />

      {/* Polished bore indicator */}
      {type === 'polished' && (
        <>
          <line
            x1={x + width * 0.2} y1={y + height * 0.2}
            x2={x + width * 0.2} y2={y + height * 0.8}
            stroke="white" strokeWidth={strokeW * 0.4} opacity={0.6}
          />
          <line
            x1={x + width * 0.35} y1={y + height * 0.15}
            x2={x + width * 0.35} y2={y + height * 0.85}
            stroke="white" strokeWidth={strokeW * 0.3} opacity={0.4}
          />
        </>
      )}
    </g>
  );
}
