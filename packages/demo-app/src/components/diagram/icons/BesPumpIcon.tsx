/** Bomba Electrosumergible — motor + intake separator + stages */
interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function BesPumpIcon({ x, y, width, height }: Props) {
  const cx = x + width / 2;
  const strokeW = Math.max(1, width * 0.04);
  const sectionH = height / 3;

  return (
    <g>
      {/* === Top section: Pump stages (centrifugal impellers) === */}
      <rect
        x={x} y={y} width={width} height={sectionH}
        fill="#ff8f00" stroke="#e65100" strokeWidth={strokeW} rx={2}
      />
      {/* Impeller discs */}
      {[0.2, 0.4, 0.6, 0.8].map(pct => (
        <line key={pct}
          x1={x + width * 0.1} y1={y + sectionH * pct}
          x2={x + width * 0.9} y2={y + sectionH * pct}
          stroke="#fff3e0" strokeWidth={strokeW * 0.6}
        />
      ))}
      {/* Shaft through pump */}
      <line
        x1={cx} y1={y} x2={cx} y2={y + sectionH}
        stroke="#5d4037" strokeWidth={width * 0.06}
      />

      {/* === Middle section: Intake / Gas separator === */}
      <rect
        x={x + width * 0.05} y={y + sectionH} width={width * 0.9} height={sectionH}
        fill="#ffb74d" stroke="#e65100" strokeWidth={strokeW} rx={2}
      />
      {/* Intake holes */}
      {[0.25, 0.5, 0.75].map(pct => (
        <g key={pct}>
          <circle cx={x + width * 0.2} cy={y + sectionH + sectionH * pct} r={width * 0.06} fill="#e65100" />
          <circle cx={x + width * 0.8} cy={y + sectionH + sectionH * pct} r={width * 0.06} fill="#e65100" />
        </g>
      ))}
      {/* Shaft */}
      <line
        x1={cx} y1={y + sectionH} x2={cx} y2={y + sectionH * 2}
        stroke="#5d4037" strokeWidth={width * 0.06}
      />

      {/* === Bottom section: Motor === */}
      <rect
        x={x - width * 0.05} y={y + sectionH * 2} width={width * 1.1} height={sectionH}
        fill="#e65100" stroke="#bf360c" strokeWidth={strokeW} rx={2}
      />
      {/* Motor windings */}
      {[0.15, 0.35, 0.55, 0.75].map(pct => {
        const my = y + sectionH * 2 + sectionH * pct;
        return (
          <g key={pct}>
            <line x1={x + width * 0.05} y1={my} x2={x + width * 0.95} y2={my}
              stroke="#ffcc80" strokeWidth={strokeW * 0.4} />
          </g>
        );
      })}
      {/* Motor center shaft */}
      <circle cx={cx} cy={y + sectionH * 2.5} r={width * 0.1} fill="#5d4037" stroke="#3e2723" strokeWidth={strokeW * 0.5} />

      {/* Cable connection point (left side, top) */}
      <rect
        x={x - width * 0.12} y={y + height * 0.02}
        width={width * 0.1} height={height * 0.06}
        fill="#ffb300" stroke="#e65100" strokeWidth={strokeW * 0.5} rx={1}
      />
    </g>
  );
}
