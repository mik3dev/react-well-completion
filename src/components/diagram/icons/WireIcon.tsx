/** Cable BES — cable trenzado/armored que baja por fuera del tubing */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function WireIcon({ x, y, width, height }: Props) {
  const cx = x + width / 2;
  const strokeW = Math.max(0.6, width * 0.12);

  // Build zigzag/braid pattern
  const segments = Math.max(4, Math.floor(height / 6));
  const segH = height / segments;
  const amp = width * 0.3;

  let path1 = `M${cx - amp * 0.3},${y}`;
  let path2 = `M${cx + amp * 0.3},${y}`;

  for (let i = 0; i < segments; i++) {
    const yy = y + segH * (i + 1);
    const dir = i % 2 === 0 ? 1 : -1;
    path1 += ` Q${cx + dir * amp},${yy - segH * 0.5} ${cx - amp * 0.3},${yy}`;
    path2 += ` Q${cx - dir * amp},${yy - segH * 0.5} ${cx + amp * 0.3},${yy}`;
  }

  return (
    <g>
      {/* Armor/jacket */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#ff8f00" stroke="#e65100" strokeWidth={strokeW * 0.3}
        rx={width * 0.3} opacity={0.3}
      />

      {/* Braid strand 1 */}
      <path d={path1} stroke="#e65100" strokeWidth={strokeW} fill="none" opacity={0.8} />

      {/* Braid strand 2 */}
      <path d={path2} stroke="#ffb300" strokeWidth={strokeW} fill="none" opacity={0.8} />

      {/* Center conductor */}
      <line x1={cx} y1={y} x2={cx} y2={y + height}
        stroke="#bf360c" strokeWidth={strokeW * 0.5} />
    </g>
  );
}
