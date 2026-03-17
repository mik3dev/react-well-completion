/** Mandril de Gas Lift — simbología en L */
interface Props {
  x: number;       // left edge of tubing
  y: number;       // center Y of the mandrel
  tubingW: number; // full tubing width
  hasValve: boolean;
  side?: 'right' | 'left';
}

export default function MandrelIcon({ x, y, tubingW, hasValve, side = 'right' }: Props) {
  const sw = 2.5;
  const color = hasValve ? '#c0392b' : '#7f8c8d';

  // L dimensions
  const armLen = 12;  // horizontal arm extending from tubing
  const legLen = 10;  // vertical leg going down

  const isRight = side === 'right';
  const wallX = isRight ? x + tubingW : x;
  const dir = isRight ? 1 : -1;

  // Horizontal arm: from tubing wall outward
  const armEndX = wallX + armLen * dir;

  // Vertical leg: from end of arm going upward
  const legEndY = y - legLen;

  return (
    <g>
      {/* Horizontal arm */}
      <line
        x1={wallX} y1={y}
        x2={armEndX} y2={y}
        stroke={color} strokeWidth={sw} strokeLinecap="round"
      />
      {/* Vertical leg */}
      <line
        x1={armEndX} y1={y}
        x2={armEndX} y2={legEndY}
        stroke={color} strokeWidth={sw} strokeLinecap="round"
      />
    </g>
  );
}
