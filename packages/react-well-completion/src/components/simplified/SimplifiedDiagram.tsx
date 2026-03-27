import { useRef, useEffect, useState, useCallback } from 'react';
import type { Well } from '../../types';
import { useDiagramConfig } from '../../hooks/use-diagram-config';
import SimplifiedCasingLayer from './SimplifiedCasingLayer';
import SimplifiedTubingLayer from './SimplifiedTubingLayer';
import SimplifiedPerforationLayer from './SimplifiedPerforationLayer';
import SimplifiedPackerLayer from './SimplifiedPackerLayer';
import SimplifiedPackingLayer from './SimplifiedPackingLayer';
import SimplifiedMandrelLayer from './SimplifiedMandrelLayer';
import SimplifiedPumpLayer from './SimplifiedPumpLayer';
import SimplifiedDepthAxis from './SimplifiedDepthAxis';

export interface SimplifiedDiagramProps {
  well: Well;
}

export default function SimplifiedDiagram({ well }: SimplifiedDiagramProps) {
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
  const configW = isH ? size.height - 60 : size.width - 40;
  const configH = isH ? size.width - 40 : size.height;
  const config = useDiagramConfig(configW, configH, well);

  const minCasingDiameter = well.casings.length > 0
    ? Math.min(...well.casings.map(c => c.diameter))
    : 0;

  return (
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
            <SimplifiedCasingLayer casings={well.casings} config={config} />
            <SimplifiedTubingLayer tubingString={well.tubingString} config={config} />
            <SimplifiedPerforationLayer
              perforations={well.perforations}
              minCasingDiameter={minCasingDiameter}
              config={config}
            />
            <SimplifiedPackerLayer packers={well.packers} config={config} />
            <SimplifiedPackingLayer packings={well.packings} casings={well.casings} config={config} />
            <SimplifiedMandrelLayer mandrels={well.mandrels} config={config} />
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
        </svg>
      )}
    </div>
  );
}
