import type { Profile } from '../../types';
import ProfileTrack from './ProfileTrack';
import { getProfileColor } from './profile-utils';

interface ProfilePanelProps {
  profiles: Profile[];
  /** Width per track (vertical) or height per track (horizontal). */
  trackWidth: number;
  /** Total height of the panel area. */
  panelHeight: number;
  /** Total width of the panel area. */
  panelWidth: number;
  depthToPos: (depth: number) => number;
  totalDepth: number;
  orientation: 'vertical' | 'horizontal';
}

export default function ProfilePanel({
  profiles,
  trackWidth,
  panelHeight,
  panelWidth,
  depthToPos,
  totalDepth,
  orientation,
}: ProfilePanelProps) {
  if (profiles.length === 0) return null;

  if (orientation === 'vertical') {
    // Place tracks left-to-right; each track is `trackWidth` px wide and full panel height.
    return (
      <g>
        {profiles.map((p, i) => (
          <g key={p.id} transform={`translate(${i * trackWidth}, 0)`}>
            <ProfileTrack
              profile={p}
              color={getProfileColor(p, i)}
              width={trackWidth}
              height={panelHeight}
              depthToPos={depthToPos}
              totalDepth={totalDepth}
              orientation="vertical"
            />
          </g>
        ))}
      </g>
    );
  }

  // Horizontal: stack tracks top-to-bottom; each is full panel width × trackWidth tall.
  return (
    <g>
      {profiles.map((p, i) => (
        <g key={p.id} transform={`translate(0, ${i * trackWidth})`}>
          <ProfileTrack
            profile={p}
            color={getProfileColor(p, i)}
            width={panelWidth}
            height={trackWidth}
            depthToPos={depthToPos}
            totalDepth={totalDepth}
            orientation="horizontal"
          />
        </g>
      ))}
    </g>
  );
}
