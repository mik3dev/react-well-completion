import type { Profile } from '../../types';
import ProfileCurve from './ProfileCurve';
import {
  sortAndFilterPoints,
  buildScale,
  formatTooltipValue,
} from './profile-utils';

interface ProfileTrackProps {
  profile: Profile;
  color: string;
  /** Width of the track in pixels. In horizontal mode, this is the full diagram width. */
  width: number;
  /** Height of the track in pixels. In horizontal mode, this is profileTrackWidth. */
  height: number;
  /** Maps depth to primary-axis position. */
  depthToPos: (depth: number) => number;
  totalDepth: number;
  orientation: 'vertical' | 'horizontal';
}

const HEADER_THICKNESS = 22;       // px reserved for the title (vertical: top; horizontal: left)
const AXIS_THICKNESS = 16;         // px reserved for tick labels
const HEADER_FONT_SIZE = 11;
const TICK_FONT_SIZE = 9;
const HEADER_FILL = '#52525b';
const TICK_FILL = '#71717a';
const HEADER_BG = '#f4f4f5';
const BORDER_COLOR = '#d4d4d8';
const GRID_COLOR = '#e4e4e7';

export default function ProfileTrack({
  profile,
  color,
  width,
  height,
  depthToPos,
  totalDepth,
  orientation,
}: ProfileTrackProps) {
  const points = sortAndFilterPoints(profile.data, totalDepth);
  const scale = buildScale(points, profile.scale);

  // Compute tick values: min, mid, max (formatted).
  const mid = (scale.min + scale.max) / 2;
  const ticks = [
    { value: scale.min, label: formatTooltipValue(scale.min) },
    { value: mid,       label: formatTooltipValue(mid) },
    { value: scale.max, label: formatTooltipValue(scale.max) },
  ];

  if (orientation === 'vertical') {
    // Layout (local coords starting at 0,0):
    //  - Header band: y in [0, HEADER_THICKNESS]
    //  - Axis band:   y in [HEADER_THICKNESS, HEADER_THICKNESS + AXIS_THICKNESS]
    //  - Curve area:  y in [HEADER_THICKNESS + AXIS_THICKNESS, height]
    const axisTop = HEADER_THICKNESS;
    const curveTop = HEADER_THICKNESS + AXIS_THICKNESS;
    const valueRange = { a: 0, b: width }; // min → left, max → right

    const tickX = (v: number) =>
      width === 0 ? 0 : ((v - scale.min) / (scale.max - scale.min || 1)) * width;

    return (
      <g>
        {/* Outer border */}
        <rect
          className="profile-track-border"
          x={0}
          y={0}
          width={width}
          height={height}
          fill="none"
          stroke={BORDER_COLOR}
          strokeWidth={1}
        />
        {/* Header background */}
        <rect x={0} y={0} width={width} height={HEADER_THICKNESS} fill={HEADER_BG} />
        <line x1={0} y1={HEADER_THICKNESS} x2={width} y2={HEADER_THICKNESS} stroke={BORDER_COLOR} />
        <text
          x={width / 2}
          y={HEADER_THICKNESS / 2 + HEADER_FONT_SIZE / 3}
          fontSize={HEADER_FONT_SIZE}
          fill={HEADER_FILL}
          fontWeight={500}
          textAnchor="middle"
        >
          {profile.name} {profile.unit}
        </text>

        {/* Axis ticks (3 labels: min, mid, max) */}
        {ticks.map((t, i) => {
          const x = i === 0 ? 4 : i === 2 ? width - 4 : tickX(t.value);
          const anchor = i === 0 ? 'start' : i === 2 ? 'end' : 'middle';
          return (
            <text
              key={`tick-${i}`}
              className="profile-tick"
              x={x}
              y={axisTop + AXIS_THICKNESS - 4}
              fontSize={TICK_FONT_SIZE}
              fill={TICK_FILL}
              textAnchor={anchor as 'start' | 'middle' | 'end'}
            >
              {t.label}
            </text>
          );
        })}
        <line x1={0} y1={curveTop} x2={width} y2={curveTop} stroke={BORDER_COLOR} />

        {/* Grid lines (vertical, at each tick) */}
        {ticks.map((t, i) => (
          <line
            key={`grid-${i}`}
            x1={tickX(t.value)}
            y1={curveTop}
            x2={tickX(t.value)}
            y2={height}
            stroke={GRID_COLOR}
            strokeDasharray="2 2"
          />
        ))}

        {/* Curve clipped to its own area via translate */}
        <g transform={`translate(0, 0)`}>
          <ProfileCurve
            profile={profile}
            color={color}
            depthToPos={depthToPos}
            valueRange={valueRange}
            scale={scale}
            orientation="vertical"
            totalDepth={totalDepth}
          />
        </g>
      </g>
    );
  }

  // Horizontal layout: header on left, axis to right of header, then curve area.
  // Total width is split as: HEADER_THICKNESS | AXIS_THICKNESS | curve area.
  const axisLeft = HEADER_THICKNESS;
  const curveLeft = HEADER_THICKNESS + AXIS_THICKNESS;
  const curveAreaWidth = width - curveLeft;
  const valueRange = { a: height, b: 0 }; // inverted: min → bottom (high y), max → top (low y)

  const tickY = (v: number) =>
    height === 0 ? 0 : height - ((v - scale.min) / (scale.max - scale.min || 1)) * height;

  return (
    <g>
      <rect
        className="profile-track-border"
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke={BORDER_COLOR}
        strokeWidth={1}
      />
      {/* Header column on the left (vertical text) */}
      <rect x={0} y={0} width={HEADER_THICKNESS} height={height} fill={HEADER_BG} />
      <line x1={HEADER_THICKNESS} y1={0} x2={HEADER_THICKNESS} y2={height} stroke={BORDER_COLOR} />
      <text
        x={HEADER_THICKNESS / 2 + HEADER_FONT_SIZE / 3}
        y={height / 2}
        fontSize={HEADER_FONT_SIZE}
        fill={HEADER_FILL}
        fontWeight={500}
        textAnchor="middle"
        transform={`rotate(-90, ${HEADER_THICKNESS / 2}, ${height / 2})`}
      >
        {profile.name} {profile.unit}
      </text>

      {/* Axis ticks on the left side of curve area */}
      {ticks.map((t, i) => {
        const y = i === 0 ? height - 4 : i === 2 ? 8 : tickY(t.value);
        return (
          <text
            key={`tick-${i}`}
            className="profile-tick"
            x={curveLeft - 3}
            y={y}
            fontSize={TICK_FONT_SIZE}
            fill={TICK_FILL}
            textAnchor="end"
          >
            {t.label}
          </text>
        );
      })}
      <line x1={curveLeft} y1={0} x2={curveLeft} y2={height} stroke={BORDER_COLOR} />

      {/* Grid lines (horizontal, at each tick) */}
      {ticks.map((t, i) => (
        <line
          key={`grid-${i}`}
          x1={curveLeft}
          y1={tickY(t.value)}
          x2={width}
          y2={tickY(t.value)}
          stroke={GRID_COLOR}
          strokeDasharray="2 2"
        />
      ))}

      {/* Curve area: shift curve so depthToPos(0) maps to curveLeft inside this group. */}
      <g transform={`translate(${curveLeft}, 0)`}>
        <ProfileCurve
          profile={profile}
          color={color}
          depthToPos={depthToPos}
          valueRange={valueRange}
          scale={scale}
          orientation="horizontal"
          totalDepth={totalDepth}
        />
      </g>
      {/* axisLeft is reserved for visual alignment; no rendering needed */}
      <g style={{ display: 'none' }} data-axis-left={axisLeft} data-curve-area-width={curveAreaWidth} />
    </g>
  );
}
