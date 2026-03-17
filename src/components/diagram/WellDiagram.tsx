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
  const configW = isH ? size.height - 30 : size.width - 50;
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
            <g transform={isH
              ? `translate(45, ${30 + config.width}) rotate(-90)`
              : 'translate(45, 0)'
            }>
              <DepthAxisLayer config={config} />
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
