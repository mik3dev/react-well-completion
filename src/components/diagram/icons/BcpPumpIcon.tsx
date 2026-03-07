/** Bomba de Cavidades Progresivas — rotor helicoidal dentro de estator */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function BcpPumpIcon({ x, y, width, height }: Props) {
  const cx = x + width / 2;
  const strokeW = Math.max(1, width * 0.04);

  // Build helical rotor path
  const segments = 6;
  const segH = height / segments;
  let rotorPath = `M${cx},${y + height * 0.05}`;
  for (let i = 0; i < segments; i++) {
    const yStart = y + height * 0.05 + i * segH;
    const dir = i % 2 === 0 ? 1 : -1;
    rotorPath += ` Q${cx + dir * width * 0.25},${yStart + segH * 0.5} ${cx},${yStart + segH}`;
  }

  return (
    <g>
      {/* Stator body (outer housing) */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="#1565c0" stroke="#0d47a1" strokeWidth={strokeW} rx={3}
      />

      {/* Stator inner cavity (elastomer) */}
      <rect
        x={x + width * 0.12} y={y + height * 0.03}
        width={width * 0.76} height={height * 0.94}
        fill="#1e88e5" stroke="#1565c0" strokeWidth={strokeW * 0.5} rx={2}
      />

      {/* Helical rotor */}
      <path
        d={rotorPath}
        stroke="#b0bec5" strokeWidth={width * 0.14} fill="none"
        strokeLinecap="round"
      />
      <path
        d={rotorPath}
        stroke="#eceff1" strokeWidth={width * 0.06} fill="none"
        strokeLinecap="round"
      />

      {/* Rod connection (top) */}
      <rect
        x={cx - width * 0.08} y={y - height * 0.02}
        width={width * 0.16} height={height * 0.08}
        fill="#9e9e9e" stroke="#333" strokeWidth={strokeW * 0.5}
      />

      {/* Intake port (bottom) */}
      <rect
        x={cx - width * 0.15} y={y + height * 0.95}
        width={width * 0.3} height={height * 0.05}
        fill="#0d47a1" stroke="#333" strokeWidth={strokeW * 0.5} rx={1}
      />
    </g>
  );
}
