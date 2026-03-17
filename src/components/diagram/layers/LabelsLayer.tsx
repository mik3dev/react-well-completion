import type { DiagramConfig, Well } from '../../../types';
import { diameterToX, computeCasingPositions } from '../../../hooks/use-diagram-config';
import { useLabelsStore } from '../../../store/labels-store';

interface Props {
  well: Well;
  config: DiagramConfig;
  minCasingDiameter: number;
}

const FONT_SIZE = 9;
const LABEL_COLOR = '#444';
const LINE_COLOR = '#bbb';

function Label({ x, y, text, anchor = 'start', bg = false }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; bg?: boolean }) {
  const charW = FONT_SIZE * 0.42;
  const pad = 2;
  const w = text.length * charW + pad * 2;
  const h = FONT_SIZE + pad * 2;
  const rx = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  return (
    <g>
      {bg && <rect x={rx - 1} y={y - h / 2} width={w + 2} height={h} fill="white" fillOpacity={0.85} rx={1} />}
      <text
        x={x} y={y}
        fontSize={FONT_SIZE}
        fill={LABEL_COLOR}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontFamily="sans-serif"
      >
        {text}
      </text>
    </g>
  );
}

function LeaderLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LINE_COLOR} strokeWidth={0.5} strokeDasharray="2,2" />;
}

export default function LabelsLayer({ well, config, minCasingDiameter }: Props) {
  const visible = useLabelsStore(s => s.visible);

  const { width } = config;
  const rightMargin = width + 8;  // labels a la derecha del diagrama
  const leftMargin = -8;          // labels a la izquierda

  return (
    <g className="layer-labels">
      {/* Casing labels — right side */}
      {visible.casings && well.casings.map(c => {
        const { x2 } = diameterToX(config, c.diameter);
        const yTop = config.depthToY(c.top);
        const yBase = config.depthToY(c.base);
        const yMid = (yTop + yBase) / 2;
        const label = `${c.diameter}" ${c.isLiner ? 'Liner' : 'Csg'}`;

        return (
          <g key={`label-csg-${c.id}`}>
            <LeaderLine x1={x2 + 5} y1={yMid} x2={rightMargin - 2} y2={yMid} />
            <Label x={rightMargin} y={yMid} text={label} />
            <Label x={rightMargin} y={yTop + FONT_SIZE + 2} text={`${c.top}'`} />
            <Label x={rightMargin} y={yBase - 2} text={`${c.base}'`} />
          </g>
        );
      })}

      {/* Tubing labels — left side */}
      {visible.tubing && (() => {
        let acc = 0;
        return well.tubingString
          .slice().sort((a, b) => a.segment - b.segment)
          .map(t => {
            const top = acc;
            acc += t.length;
            const base = acc;
            const { x1 } = diameterToX(config, t.diameter);
            const yMid = (config.depthToY(top) + config.depthToY(base)) / 2;

            return (
              <g key={`label-tbg-${t.id}`}>
                <LeaderLine x1={x1 - 5} y1={yMid} x2={leftMargin + 2} y2={yMid} />
                <Label x={leftMargin} y={yMid - 5} text={`Tbg ${t.diameter}"`} anchor="end" />
                <Label x={leftMargin} y={yMid + 5} text={`${t.length} ft`} anchor="end" />
              </g>
            );
          });
      })()}

      {/* Rod labels — left side, offset further */}
      {visible.rods && (() => {
        let acc = 0;
        return well.rodString
          .slice().sort((a, b) => a.segment - b.segment)
          .map(r => {
            const top = acc;
            acc += r.length;
            const base = acc;
            const yMid = (config.depthToY(top) + config.depthToY(base)) / 2;

            return (
              <g key={`label-rod-${r.id}`}>
                <Label x={leftMargin - 50} y={yMid} text={`Rod ${r.diameter}" ${r.length}ft`} anchor="end" />
              </g>
            );
          });
      })()}

      {/* Pump label */}
      {visible.pump && well.pump && (() => {
        const y = config.depthToY(well.pump.depth);
        const labels: Record<string, string> = {
          BM: 'B. Mecánica',
          BCP: 'BCP',
          BES: 'BES',
          GL: 'Gas Lift',
        };
        return (
          <g>
            <Label x={rightMargin} y={y} text={`${labels[well.pump.type]} @ ${well.pump.depth}'`} />
          </g>
        );
      })()}

      {/* Sand labels — left side */}
      {visible.sands && well.sands.map(s => {
        const { x1 } = diameterToX(config, minCasingDiameter);
        const yMid = (config.depthToY(s.top) + config.depthToY(s.base)) / 2;
        return (
          <g key={`label-sand-${s.id}`}>
            <LeaderLine x1={0} y1={yMid} x2={x1 - 5} y2={yMid} />
            <Label x={4} y={yMid - 5} text={s.name} />
            <Label x={4} y={yMid + 5} text={`${s.top}' - ${s.base}'`} />
          </g>
        );
      })}

      {/* Perforation labels — right side, with anti-overlap */}
      {visible.perforations && (() => {
        const MIN_SPACING = FONT_SIZE + 4;
        const sorted = [...well.perforations].sort((a, b) => a.top - b.top);
        let lastY = -Infinity;
        return sorted.map(p => {
          const { x2 } = diameterToX(config, minCasingDiameter);
          let yMid = (config.depthToY(p.top) + config.depthToY(p.base)) / 2;
          if (yMid - lastY < MIN_SPACING) yMid = lastY + MIN_SPACING;
          lastY = yMid;
          const tipo = p.type === 'shoot' ? 'Cañ.' : 'Ran.';
          return (
            <g key={`label-perf-${p.id}`}>
              <LeaderLine x1={x2 + 5} y1={yMid} x2={rightMargin - 2} y2={yMid} />
              <Label x={rightMargin} y={yMid} text={`${tipo} ${p.top}'-${p.base}'`} bg />
            </g>
          );
        });
      })()}

      {/* Packer labels */}
      {visible.packers && well.packers.map(p => {
        const y = config.depthToY(p.depth);
        return (
          <g key={`label-pkr-${p.id}`}>
            <Label x={rightMargin} y={y} text={`Packer @ ${p.depth}'`} />
          </g>
        );
      })}

      {/* Nipple labels */}
      {visible.nipples && well.seatNipples.map(n => {
        const y = config.depthToY(n.depth);
        const tipo = n.type === 'polished' ? 'N.Pulido' : 'N.Asiento';
        return (
          <g key={`label-nip-${n.id}`}>
            <Label x={rightMargin} y={y} text={`${tipo} ${n.diameter}" @ ${n.depth}'`} />
          </g>
        );
      })}

      {/* Mandrel labels — positioned outside the outermost casing */}
      {visible.mandrels && (() => {
        const casingPos = computeCasingPositions(well.casings, config);
        // Find the rightmost casing edge (outermost casing x2)
        let outerX2 = 0;
        for (const pos of casingPos.values()) {
          if (pos.x2 > outerX2) outerX2 = pos.x2;
        }
        return well.mandrels.map(m => {
          const y = config.depthToY(m.depth);
          const valvula = m.hasValve ? ' +VGL' : '';
          return (
            <g key={`label-mdr-${m.id}`}>
              <Label x={outerX2 + 8} y={y} text={`M${m.segment}${valvula} @ ${m.depth}'`} />
            </g>
          );
        });
      })()}

      {/* Yacimiento / Arena labels — left side, hierarchical brackets */}
      {visible.yacimientos && (() => {
        const withYac = well.perforations.filter(p => p.yacimiento);
        if (withYac.length === 0) return null;

        const { x1 } = diameterToX(config, minCasingDiameter);
        // Layout: casing wall ... interval text ... arena bracket ... yac bracket
        // Interval text right-aligned close to casing; brackets to the left
        const layoutCharW = FONT_SIZE * 0.55;
        const maxIntervalLen = Math.max(...withYac.map(p => `${p.top}' - ${p.base}' (${p.base - p.top}')`.length));
        const intervalTextW = maxIntervalLen * layoutCharW + 8;
        const xInterval  = x1 - 20;                      // interval text (anchor=end, near casing)
        const xArena     = x1 - intervalTextW - 10;      // arena bracket left of interval text
        const xYac       = xArena - 50;                   // yacimiento bracket left of arena
        const bracketColor = '#555';

        // Group by yacimiento
        const byYac: Record<string, typeof withYac> = {};
        withYac.forEach(p => {
          const k = p.yacimiento!;
          if (!byYac[k]) byYac[k] = [];
          byYac[k].push(p);
        });

        return Object.entries(byYac).map(([yacName, yacPerfs]) => {
          const yacTop  = config.depthToY(Math.min(...yacPerfs.map(p => p.top)));
          const yacBase = config.depthToY(Math.max(...yacPerfs.map(p => p.base)));
          const yacMid  = (yacTop + yacBase) / 2;

          // Group by arena within yacimiento
          const byArena: Record<string, typeof yacPerfs> = {};
          yacPerfs.forEach(p => {
            const k = p.arena ?? '__none__';
            if (!byArena[k]) byArena[k] = [];
            byArena[k].push(p);
          });

          const hasArenas = Object.keys(byArena).some(k => k !== '__none__');

          return (
            <g key={`yac-lbl-${yacName}`}>
              {/* Yacimiento bracket */}
              <line x1={xYac} y1={yacTop}  x2={xYac + 6} y2={yacTop}  stroke={bracketColor} strokeWidth={0.8} />
              <line x1={xYac} y1={yacBase} x2={xYac + 6} y2={yacBase} stroke={bracketColor} strokeWidth={0.8} />
              <line x1={xYac} y1={yacTop}  x2={xYac}     y2={yacBase} stroke={bracketColor} strokeWidth={0.8} />
              <Label x={xYac - 3} y={yacMid} text={yacName} anchor="end" bg />

              {Object.entries(byArena).map(([arenaName, aPerfs]) => {
                const aTop  = config.depthToY(Math.min(...aPerfs.map(p => p.top)));
                const aBase = config.depthToY(Math.max(...aPerfs.map(p => p.base)));
                const aMid  = (aTop + aBase) / 2;

                return (
                  <g key={`arena-lbl-${arenaName}`}>
                    {/* Arena bracket (only when arena field is set) */}
                    {arenaName !== '__none__' && (
                      <>
                        <line x1={xArena} y1={aTop}  x2={xArena + 5} y2={aTop}  stroke={bracketColor} strokeWidth={0.7} />
                        <line x1={xArena} y1={aBase} x2={xArena + 5} y2={aBase} stroke={bracketColor} strokeWidth={0.7} />
                        <line x1={xArena} y1={aTop}  x2={xArena}     y2={aBase} stroke={bracketColor} strokeWidth={0.7} />
                        <Label x={xArena - 3} y={aMid} text={arenaName} anchor="end" bg />
                      </>
                    )}
                    {/* Interval list */}
                    {aPerfs.map(p => {
                      const yMid    = (config.depthToY(p.top) + config.depthToY(p.base)) / 2;
                      const espesor = p.base - p.top;
                      const xText   = hasArenas ? xInterval : xInterval;
                      return (
                        <Label
                          key={`interval-${p.id}`}
                          x={xText}
                          y={yMid}
                          text={`${p.top}' - ${p.base}' (${espesor}')`}
                          anchor="end"
                          bg
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        });
      })()}

      {/* Depth markers */}
      {visible.depths && (() => {
        const depths = new Set<number>();
        // Collect key depths
        well.casings.forEach(c => { depths.add(c.top); depths.add(c.base); });
        if (well.pump) depths.add(well.pump.depth);
        if (well.totalFreeDepth) depths.add(well.totalFreeDepth);
        depths.add(well.totalDepth);
        depths.delete(0);

        const sortedDepths = [...depths].sort((a, b) => a - b);
        return sortedDepths.map(d => {
          const y = config.depthToY(d);
          return (
            <g key={`depth-${d}`}>
              <line x1={0} y1={y} x2={width} y2={y} stroke="#f44336" strokeWidth={0.3} strokeDasharray="4,3" />
              <rect x={-42} y={y - 7} width={40} height={14} fill="white" stroke="#f44336" strokeWidth={0.5} rx={2} />
              <text x={-22} y={y + 1} fontSize={8} fill="#f44336" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                {d}'
              </text>
            </g>
          );
        });
      })()}
    </g>
  );
}
