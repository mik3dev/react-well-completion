import { useRef, useEffect, useState, useCallback } from 'react';
import type { Well, LabelCategory } from '../types';
import { ALL_LABEL_CATEGORIES } from '../types';
import type { Profile, ProfileLayout } from '../types';
import { useDiagramConfig } from '../hooks/use-diagram-config';
import type { BrandTheme } from '../theme';
import ProfilePanel from './profiles/ProfilePanel';
import { defaultTheme } from '../theme';
import { TooltipProvider } from './Tooltip';
import SvgDefs from './SvgDefs';
import SandLayer from './layers/SandLayer';
import CasingLayer from './layers/CasingLayer';
import TubingLayer from './layers/TubingLayer';
import RodLayer from './layers/RodLayer';
import PumpLayer from './layers/PumpLayer';
import PerforationLayer from './layers/PerforationLayer';
import AccessoriesLayer from './layers/AccessoriesLayer';
import WireLayer from './layers/WireLayer';
import EarthLayer from './layers/EarthLayer';
import DepthAxisLayer from './layers/DepthAxisLayer';
import LabelsLayer from './layers/LabelsLayer';
import WellDetailLayer from './layers/WellDetailLayer';

export interface WellDiagramProps {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;
  theme?: Partial<BrandTheme>;
  profiles?: Profile[];
  profileLayout?: ProfileLayout;
  profileTrackWidth?: number;
}

const DEFAULT_PROFILE_TRACK_WIDTH = 140;

export default function WellDiagram({
  well,
  labels,
  theme,
  profiles,
  // profileLayout is reserved for v2 (overlay mode); v1 only supports 'tracks'.
  profileTrackWidth = DEFAULT_PROFILE_TRACK_WIDTH,
}: WellDiagramProps) {
  const safeProfiles = profiles ?? [];
  const hasProfiles = safeProfiles.length > 0;
  const mergedTheme: BrandTheme = { ...defaultTheme, ...theme };
  const defaultLabels = Object.fromEntries(
    ALL_LABEL_CATEGORIES.map(k => [k, true])
  ) as Record<LabelCategory, boolean>;
  const mergedLabels = { ...defaultLabels, ...labels };
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
  const halfSection = well.halfSection ?? false;
  const halfSide = well.halfSide ?? 'right';

  // When half-section is combined with profiles, the panel takes over the
  // otherwise-empty half of the diagram. Two flavors:
  //   - Vertical:   panel fills the freed left/right half (depending on halfSide)
  //   - Horizontal: panel fills the freed top/bottom half (depending on halfSide)
  const halfSecPanelFillV = !isH && halfSection && hasProfiles;
  const halfSecPanelFillH =  isH && halfSection && hasProfiles;

  // Track sizing — vertical:
  // - Standard: each track = profileTrackWidth (fixed).
  // - Half-section fill: each track grows to occupy the freed half;
  //   profileTrackWidth becomes a minimum (the panel may overflow into the
  //   diagram side if the consumer set a min larger than the freed slot).
  const halfAvailableW = (size.width - 50) / 2;
  const effectiveTrackWidth = halfSecPanelFillV && safeProfiles.length > 0
    ? Math.max(profileTrackWidth, halfAvailableW / safeProfiles.length)
    : profileTrackWidth;
  const panelWidth = hasProfiles ? safeProfiles.length * effectiveTrackWidth : 0;

  // Track sizing — horizontal: same logic, but the "available space" is the
  // vertical half of the diagram-allocated area.
  const halfAvailableH = (size.height - 100) / 2;
  const effectiveTrackHeightH = halfSecPanelFillH && safeProfiles.length > 0
    ? Math.max(profileTrackWidth, halfAvailableH / safeProfiles.length)
    : profileTrackWidth;

  // For horizontal: swap dimensions so config generates vertical coords
  // that get rotated by the SVG transform
  // Fixed margins: 45px left for vertical depth axis, 120px bottom for horizontal labels + depth axis
  //
  // panel space reservation:
  //   vertical (standard):       panel goes to the right → subtract panelWidth from horizontal space
  //   vertical (half-sec fill):  diagram uses one half, panel uses the other → keep full width
  //   horizontal (standard):     panel goes below diagram → subtract panelHeight from vertical space
  //   horizontal (half-sec fill): diagram uses one half, panel uses the other → keep full vertical
  //
  // In horizontal mode the diagram is rotated, so config dimensions are swapped:
  //   configW = vertical-axis pixels (originally size.height minus chrome)
  //   configH = horizontal-axis pixels (originally size.width minus chrome)
  const panelHeight = isH && hasProfiles
    ? safeProfiles.length * effectiveTrackHeightH
    : 0;

  const configW = isH
    ? halfSecPanelFillH
      ? size.height - 100
      : size.height - 100 - panelHeight
    : halfSecPanelFillV
      ? size.width - 50
      : size.width - 50 - panelWidth;
  const configH = isH ? size.width - 50 : size.height;
  const config = useDiagramConfig(configW, configH, well);

  const minCasingDiameter = well.casings.length > 0
    ? Math.min(...well.casings.map(c => c.diameter))
    : 0;

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        id="well-diagram"
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
            <SvgDefs />
            {/* Offset for depth axis labels; rotation for horizontal */}
            {/* In vertical: depth axis inside the group. In horizontal: rendered separately below */}
            {!isH && (
              <g transform="translate(45, 0)">
                <DepthAxisLayer config={config} />
              </g>
            )}
            <g transform={isH
              ? `translate(45, ${30 + config.width}) rotate(-90)`
              : 'translate(45, 0)'
            }>
              <SandLayer sands={well.sands} casings={well.casings} config={config} />
              <EarthLayer
                totalFreeDepth={well.totalFreeDepth}
                totalDepth={well.totalDepth}
                casings={well.casings}
                config={config}
              />
              <CasingLayer casings={well.casings} config={config} />
              <PerforationLayer
                perforations={well.perforations}
                casings={well.casings}
                config={config}
              />
              <TubingLayer tubingString={well.tubingString} config={config} />
              <RodLayer rodString={well.rodString} config={config} />
              <WireLayer wire={well.wire} tubingString={well.tubingString} config={config} />
              <PumpLayer pump={well.pump} config={config} />
              <AccessoriesLayer well={well} config={config} minCasingDiameter={minCasingDiameter} />
              <LabelsLayer well={well} config={config} minCasingDiameter={minCasingDiameter} visible={mergedLabels} />
              {/* Línea de eje central en half-section (always vertical in local coords) */}
              {config.halfSection && (
                <line
                  x1={config.centerLine} y1={0}
                  x2={config.centerLine} y2={config.height}
                  stroke="#999" strokeWidth={0.8}
                  strokeDasharray="6,3"
                />
              )}
            </g>

            {/* Horizontal depth axis — rendered outside rotation group at bottom */}
            {isH && config && (() => {
              const axisY = size.height - 20;
              // Note: when profiles are present in horizontal mode, the panel lives
              // between the diagram and the axis. We keep axisY at the bottom so the
              // depth axis remains the last horizontal element, immediately below the panel.
              const ticks: number[] = [];
              let interval = config.maxDepth / 10;
              const mag = Math.pow(10, Math.floor(Math.log10(interval)));
              const norm = interval / mag;
              interval = norm <= 1 ? mag : norm <= 2 ? 2 * mag : norm <= 5 ? 5 * mag : 10 * mag;
              for (let d = 0; d <= config.maxDepth; d += interval) ticks.push(d);
              return (
                <g>
                  <line x1={45} y1={axisY} x2={size.width} y2={axisY} stroke="#ccc" strokeWidth={1} />
                  {ticks.map(d => {
                    // Map depth to horizontal position: same gamma as depthToPos but mapped to screen X
                    const x = 45 + (config.maxDepth > 0 ? Math.pow(d / config.maxDepth, 1.5) * (size.width - 50) : 0);
                    return (
                      <g key={`htick-${d}`}>
                        <line x1={x} y1={axisY} x2={x} y2={axisY + 6} stroke="#999" strokeWidth={1} />
                        <text x={x} y={axisY + 16} fontSize={9} fill="#666" textAnchor="middle">{d}'</text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* WellDetailLayer rendered outside rotation group so it stays fixed */}
            {config && (
              <g transform="translate(45, 0)">
                <WellDetailLayer well={well} config={{
                  ...config,
                  // In horizontal, restore original container dimensions for positioning
                  width: size.width - 50,
                  height: size.height,
                }} visible={mergedLabels} theme={mergedTheme} />
              </g>
            )}

            {/* Profile panel — vertical mode.
             *
             * Positioning:
             * - Standard (no half-section): panel sits at the right edge.
             * - Half-section fill: panel occupies the freed half. Side depends
             *   on halfSide — diagram on right → panel on left, and vice versa.
             *   In screen coords, the diagram is wrapped in translate(45, 0),
             *   so its half-area starts at x=45 and the centerLine is at
             *   x = 45 + (size.width - 50) / 2.
             */}
            {hasProfiles && !isH && config && (() => {
              const panelOffsetX = halfSecPanelFillV
                ? (halfSide === 'right' ? 45 : 45 + halfAvailableW)
                : size.width - panelWidth;
              return (
                <g transform={`translate(${panelOffsetX}, 0)`}>
                  <ProfilePanel
                    profiles={safeProfiles}
                    trackWidth={effectiveTrackWidth}
                    panelHeight={config.height}
                    panelWidth={panelWidth}
                    depthToPos={config.depthToPos}
                    totalDepth={well.totalDepth}
                    orientation="vertical"
                  />
                </g>
              );
            })()}

            {/* Profile panel — horizontal mode.
             *
             * Positioning:
             * - Standard (no half-section): panel sits below the diagram at
             *   y = 30 + config.width.
             * - Half-section fill: panel takes the half opposite the drawn
             *   diagram half. After the diagram's -90° rotation, the local
             *   centerLine maps to screen Y = 30 + config.width / 2.
             *   - halfSide='right' → diagram drawn in upper half → panel
             *     positioned in the lower half (offsetY = 30 + halfAvail).
             *   - halfSide='left'  → diagram drawn in lower half → panel
             *     positioned in the upper half (offsetY = 30).
             */}
            {hasProfiles && isH && config && (() => {
              const panelOffsetY = halfSecPanelFillH
                ? (halfSide === 'right' ? 30 + halfAvailableH : 30)
                : 30 + config.width;
              return (
                <g transform={`translate(45, ${panelOffsetY})`}>
                  <ProfilePanel
                    profiles={safeProfiles}
                    trackWidth={effectiveTrackHeightH}
                    panelHeight={panelHeight}
                    panelWidth={size.width - 50}
                    depthToPos={(d: number) => {
                      // In horizontal mode the diagram itself is rotated via SVG transform.
                      // For the panel (which is NOT rotated), we map depth directly to X
                      // using the same gamma γ=1.5 as the diagram's depthToPos.
                      if (well.totalDepth === 0) return 0;
                      return Math.pow(d / well.totalDepth, 1.5) * (size.width - 50);
                    }}
                    totalDepth={well.totalDepth}
                    orientation="horizontal"
                  />
                </g>
              );
            })()}
          </svg>
        )}
      </div>
    </TooltipProvider>
  );
}
