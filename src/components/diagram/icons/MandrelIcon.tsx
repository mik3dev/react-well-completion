/** Mandril de Gas Lift — pocket con o sin válvula */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  hasValve: boolean;
}

export default function MandrelIcon({ x, y, width, height, hasValve }: Props) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const strokeW = Math.max(0.8, width * 0.04);

  return (
    <g>
      {/* Pocket body */}
      <rect
        x={x} y={y} width={width} height={height}
        fill={hasValve ? '#2e7d32' : '#bdbdbd'}
        stroke={hasValve ? '#1b5e20' : '#757575'}
        strokeWidth={strokeW} rx={2}
      />

      {/* Pocket opening (side port) */}
      <rect
        x={x + width * 0.7} y={y + height * 0.3}
        width={width * 0.3} height={height * 0.4}
        fill={hasValve ? '#1b5e20' : '#9e9e9e'}
        stroke={hasValve ? '#0d3311' : '#616161'}
        strokeWidth={strokeW * 0.5} rx={1}
      />

      {hasValve ? (
        <>
          {/* Valve body */}
          <ellipse
            cx={cx - width * 0.05} cy={cy}
            rx={width * 0.25} ry={height * 0.25}
            fill="#4caf50" stroke="#1b5e20" strokeWidth={strokeW * 0.8}
          />
          {/* Valve stem */}
          <line
            x1={cx - width * 0.05} y1={y + height * 0.15}
            x2={cx - width * 0.05} y2={y + height * 0.85}
            stroke="#1b5e20" strokeWidth={strokeW * 0.8}
          />
          {/* Orifice indicator */}
          <circle
            cx={cx - width * 0.05} cy={cy}
            r={width * 0.08}
            fill="white" stroke="#1b5e20" strokeWidth={strokeW * 0.5}
          />
        </>
      ) : (
        <>
          {/* Empty pocket (dummy) — X mark */}
          <line x1={x + width * 0.2} y1={y + height * 0.2}
            x2={x + width * 0.6} y2={y + height * 0.8}
            stroke="#757575" strokeWidth={strokeW * 0.8} />
          <line x1={x + width * 0.6} y1={y + height * 0.2}
            x2={x + width * 0.2} y2={y + height * 0.8}
            stroke="#757575" strokeWidth={strokeW * 0.8} />
        </>
      )}

      {/* Top/bottom flanges */}
      <line x1={x} y1={y + height * 0.08} x2={x + width} y2={y + height * 0.08}
        stroke={hasValve ? '#1b5e20' : '#616161'} strokeWidth={strokeW * 0.6} />
      <line x1={x} y1={y + height * 0.92} x2={x + width} y2={y + height * 0.92}
        stroke={hasValve ? '#1b5e20' : '#616161'} strokeWidth={strokeW * 0.6} />
    </g>
  );
}
