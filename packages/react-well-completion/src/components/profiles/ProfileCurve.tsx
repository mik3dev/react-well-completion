import type { Profile } from '../../types';
import { useTooltip } from '../tooltip-context';
import {
  sortAndFilterPoints,
  valueToPos,
  formatTooltipValue,
} from './profile-utils';

interface ProfileCurveProps {
  profile: Profile;
  color: string;
  /** Maps depth (ft) to position along the primary axis (px). */
  depthToPos: (depth: number) => number;
  /** Pixel range [a, b] of the value axis inside the track. */
  valueRange: { a: number; b: number };
  /** Resolved value scale for this profile. */
  scale: { min: number; max: number };
  /** Orientation of the host diagram. */
  orientation: 'vertical' | 'horizontal';
  /** Total well depth, for filtering out-of-range points. */
  totalDepth?: number;
}

const HOVER_RADIUS = 4;
const SINGLE_POINT_RADIUS = 3;

export default function ProfileCurve({
  profile,
  color,
  depthToPos,
  valueRange,
  scale,
  orientation,
  totalDepth,
}: ProfileCurveProps) {
  const tooltip = useTooltip();
  const points = sortAndFilterPoints(
    profile.data,
    totalDepth ?? Number.POSITIVE_INFINITY,
  );

  if (points.length === 0) return null;

  // Each point becomes (primary, secondary) in screen coords.
  // - vertical: depth → y (primary), value → x (secondary)
  // - horizontal: depth → x (primary), value → y (secondary)
  const projected = points.map(p => {
    const primary = depthToPos(p.depth);
    const secondary = valueToPos(p.value, scale, valueRange.a, valueRange.b);
    return orientation === 'vertical'
      ? { x: secondary, y: primary, point: p }
      : { x: primary, y: secondary, point: p };
  });

  const tooltipLines = (depth: number, value: number) => [
    `${profile.name}: ${formatTooltipValue(value)} ${profile.unit}`,
    `@ ${Math.round(depth)} ft`,
  ];

  if (projected.length === 1) {
    const { x, y, point } = projected[0];
    return (
      <circle
        cx={x}
        cy={y}
        r={SINGLE_POINT_RADIUS}
        fill={color}
        onMouseEnter={e => tooltip.show(e, tooltipLines(point.depth, point.value))}
        onMouseMove={e => tooltip.move(e)}
        onMouseLeave={() => tooltip.hide()}
      />
    );
  }

  const polyPoints = projected.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <g>
      <polyline
        points={polyPoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {projected.map((p, i) => (
        <circle
          key={`${profile.id}-${i}`}
          cx={p.x}
          cy={p.y}
          r={HOVER_RADIUS}
          fill="transparent"
          stroke="transparent"
          pointerEvents="all"
          onMouseEnter={e => tooltip.show(e, tooltipLines(p.point.depth, p.point.value))}
          onMouseMove={e => tooltip.move(e)}
          onMouseLeave={() => tooltip.hide()}
        />
      ))}
    </g>
  );
}
