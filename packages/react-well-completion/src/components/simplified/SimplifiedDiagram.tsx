import { useRef, useEffect, useState, useCallback } from 'react';
import type { Well, Profile, ProfileLayout } from '../../types';
import { useDiagramConfig } from '../../hooks/use-diagram-config';
import SimplifiedCasingLayer from './SimplifiedCasingLayer';
import SimplifiedTubingLayer from './SimplifiedTubingLayer';
import SimplifiedPerforationLayer from './SimplifiedPerforationLayer';
import SimplifiedPackerLayer from './SimplifiedPackerLayer';
import SimplifiedPackingLayer from './SimplifiedPackingLayer';
import SimplifiedMandrelLayer from './SimplifiedMandrelLayer';
import SimplifiedPumpLayer from './SimplifiedPumpLayer';
import SimplifiedDepthAxis from './SimplifiedDepthAxis';
import EarthLayer from '../layers/EarthLayer';
import ProfilePanel from '../profiles/ProfilePanel';
import { TooltipProvider } from '../Tooltip';

export interface SimplifiedDiagramProps {
  well: Well;
  profiles?: Profile[];
  profileLayout?: ProfileLayout;
  profileTrackWidth?: number;
  /**
   * Fill used by the earth/formation area below `max(non-liner shoes)`.
   * Defaults to `'transparent'` (no visible earth, keeping the schematic look).
   * Set to `'#fafafa'`, `'url(#earthFill)'`, or any CSS color to show the formation.
   */
  earthFill?: string;
}

const DEFAULT_PROFILE_TRACK_WIDTH = 140;
const DEFAULT_SIMPLIFIED_EARTH_FILL = 'transparent';

export default function SimplifiedDiagram({
  well,
  profiles,
  // profileLayout is reserved for v2 (overlay mode); v1 only supports 'tracks'.
  profileTrackWidth = DEFAULT_PROFILE_TRACK_WIDTH,
  earthFill = DEFAULT_SIMPLIFIED_EARTH_FILL,
}: SimplifiedDiagramProps) {
  const safeProfiles = profiles ?? [];
  const hasProfiles = safeProfiles.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  const isH = (well.orientation ?? 'vertical') === 'horizontal';

  // Panel space reservation:
  //   vertical:   panel goes to the right → subtract panelWidth from horizontal space.
  //   horizontal: panel goes below diagram → subtract panelHeight from vertical space.
  // Note: SimplifiedDiagram does not support half-section fill (its layers use
  // legacy `computeCasingPositions`, which is symmetric and ignores halfSection).
  // So we always use the standard fixed-track-width layout.
  const panelWidth = hasProfiles && !isH ? safeProfiles.length * profileTrackWidth : 0;
  const panelHeight = hasProfiles && isH ? safeProfiles.length * profileTrackWidth : 0;

  const configW = isH
    ? size.height - 60 - panelHeight
    : size.width - 40 - panelWidth;
  const configH = isH ? size.width - 40 : size.height;
  const config = useDiagramConfig(configW, configH, well);

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'white',
        }}
      >
        {config && (
          <svg
            width={size.width}
            height={size.height}
            style={{ display: 'block' }}
          >
            {/* Vertical depth axis — only in vertical mode */}
            {!isH && (
              <g transform="translate(35, 0)">
                <SimplifiedDepthAxis config={config} />
              </g>
            )}

            {/* Main layers group — rotated for horizontal */}
            <g transform={isH
              ? `translate(35, ${20 + config.width}) rotate(-90)`
              : 'translate(35, 0)'
            }>
              {/* Earth/formation behind everything else — only renders if earthFill is non-transparent and there is a non-liner casing shoe above totalDepth. */}
              <EarthLayer
                totalFreeDepth={well.totalFreeDepth}
                totalDepth={well.totalDepth}
                casings={well.casings}
                config={config}
                fill={earthFill}
              />
              <SimplifiedCasingLayer casings={well.casings} config={config} />
              <SimplifiedTubingLayer tubingString={well.tubingString} config={config} />
              <SimplifiedPerforationLayer
                perforations={well.perforations}
                casings={well.casings}
                config={config}
              />
              <SimplifiedPackerLayer packers={well.packers} tubingString={well.tubingString} config={config} />
              <SimplifiedPackingLayer packings={well.packings} casings={well.casings} tubingString={well.tubingString} config={config} />
              <SimplifiedMandrelLayer mandrels={well.mandrels} tubingString={well.tubingString} config={config} />
              <SimplifiedPumpLayer pump={well.pump} config={config} />
            </g>

            {/* Horizontal depth axis — only in horizontal mode, outside rotation */}
            {isH && (() => {
              const axisY = size.height - 18;
              const rawInterval = config.maxDepth / 8;
              const mag = Math.pow(10, Math.floor(Math.log10(rawInterval)));
              const norm = rawInterval / mag;
              const interval = norm <= 1 ? mag : norm <= 2 ? 2 * mag : norm <= 5 ? 5 * mag : 10 * mag;
              const ticks: number[] = [];
              for (let d = 0; d <= config.maxDepth; d += interval) ticks.push(d);
              return (
                <g>
                  <line x1={35} y1={axisY} x2={size.width} y2={axisY} stroke="#bbb" strokeWidth={1} />
                  {ticks.map(d => {
                    const x = 35 + (config.maxDepth > 0 ? Math.pow(d / config.maxDepth, 1.5) * (size.width - 40) : 0);
                    return (
                      <g key={`htick-${d}`}>
                        <line x1={x} y1={axisY} x2={x} y2={axisY + 5} stroke="#999" strokeWidth={1} />
                        <text x={x} y={axisY + 14} fontSize={8} fill="#666" textAnchor="middle" fontFamily="sans-serif">{d}'</text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* Profile panel — vertical: positioned to the right of the diagram. */}
            {hasProfiles && !isH && (
              <g transform={`translate(${size.width - panelWidth}, 0)`}>
                <ProfilePanel
                  profiles={safeProfiles}
                  trackWidth={profileTrackWidth}
                  panelHeight={config.height}
                  panelWidth={panelWidth}
                  depthToPos={config.depthToPos}
                  totalDepth={well.totalDepth}
                  orientation="vertical"
                />
              </g>
            )}

            {/* Profile panel — horizontal: positioned below the diagram (above the depth axis). */}
            {hasProfiles && isH && (
              <g transform={`translate(35, ${20 + config.width})`}>
                <ProfilePanel
                  profiles={safeProfiles}
                  trackWidth={profileTrackWidth}
                  panelHeight={panelHeight}
                  panelWidth={size.width - 40}
                  depthToPos={(d: number) => {
                    // In horizontal mode the diagram is rotated via SVG transform.
                    // For the panel (which is NOT rotated), we map depth directly to X
                    // using the same gamma γ=1.5 as the diagram's depthToPos.
                    if (well.totalDepth === 0) return 0;
                    return Math.pow(d / well.totalDepth, 1.5) * (size.width - 40);
                  }}
                  totalDepth={well.totalDepth}
                  orientation="horizontal"
                />
              </g>
            )}
          </svg>
        )}
      </div>
    </TooltipProvider>
  );
}
