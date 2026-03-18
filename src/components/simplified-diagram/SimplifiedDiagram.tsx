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

interface Props {
  well: Well;
}

export default function SimplifiedDiagram({ well }: Props) {
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

  const configW = size.width - 40;
  const configH = size.height;
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
          <g transform="translate(35, 0)">
            <SimplifiedDepthAxis config={config} />
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
        </svg>
      )}
    </div>
  );
}
