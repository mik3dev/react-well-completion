import { useRef, useEffect, useState, useCallback } from 'react';
import type { Well } from '../../types';
import { useDiagramConfig } from '../../hooks/use-diagram-config';
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

interface Props {
  well: Well;
}

export default function WellDiagram({ well }: Props) {
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
  // For horizontal: swap dimensions so config generates vertical coords
  // that get rotated by the SVG transform
  // In horizontal, leave margin for depth axis at bottom
  const configW = isH ? size.height - 60 : size.width - 50;
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
              <SandLayer sands={well.sands} minCasingDiameter={minCasingDiameter} config={config} />
              <EarthLayer
                totalFreeDepth={well.totalFreeDepth}
                totalDepth={well.totalDepth}
                minCasingDiameter={minCasingDiameter}
                config={config}
              />
              <CasingLayer casings={well.casings} config={config} />
              <PerforationLayer
                perforations={well.perforations}
                minCasingDiameter={minCasingDiameter}
                config={config}
              />
              <TubingLayer tubingString={well.tubingString} config={config} />
              <RodLayer rodString={well.rodString} config={config} />
              <WireLayer wire={well.wire} tubingString={well.tubingString} config={config} />
              <PumpLayer pump={well.pump} config={config} />
              <AccessoriesLayer well={well} config={config} minCasingDiameter={minCasingDiameter} />
              <LabelsLayer well={well} config={config} minCasingDiameter={minCasingDiameter} />
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
                }} />
              </g>
            )}
          </svg>
        )}
      </div>
    </TooltipProvider>
  );
}
