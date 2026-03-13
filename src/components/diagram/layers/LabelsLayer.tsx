import type { DiagramConfig, Well } from '../../../types';
import { diameterToX } from '../../../hooks/use-diagram-config';
import { useLabelsStore } from '../../../store/labels-store';

interface Props {
  well: Well;
  config: DiagramConfig;
  minCasingDiameter: number;
}

const FONT_SIZE = 9;
const LABEL_COLOR = '#444';
const LINE_COLOR = '#bbb';

function Label({ x, y, text, anchor = 'start' }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
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
        const yTop = c.top * config.pxPerFt;
        const yBase = c.base * config.pxPerFt;
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
            const yMid = ((top + base) / 2) * config.pxPerFt;

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
            const yMid = ((top + base) / 2) * config.pxPerFt;

            return (
              <g key={`label-rod-${r.id}`}>
                <Label x={leftMargin - 50} y={yMid} text={`Rod ${r.diameter}" ${r.length}ft`} anchor="end" />
              </g>
            );
          });
      })()}

      {/* Pump label */}
      {visible.pump && well.pump && (() => {
        const y = well.pump.depth * config.pxPerFt;
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
        const yMid = ((s.top + s.base) / 2) * config.pxPerFt;
        return (
          <g key={`label-sand-${s.id}`}>
            <LeaderLine x1={0} y1={yMid} x2={x1 - 5} y2={yMid} />
            <Label x={4} y={yMid - 5} text={s.name} />
            <Label x={4} y={yMid + 5} text={`${s.top}' - ${s.base}'`} />
          </g>
        );
      })}

      {/* Perforation labels — right side */}
      {visible.perforations && well.perforations.map(p => {
        const { x2 } = diameterToX(config, minCasingDiameter);
        const yMid = ((p.top + p.base) / 2) * config.pxPerFt;
        const tipo = p.type === 'shoot' ? 'Cañ.' : 'Ran.';
        return (
          <g key={`label-perf-${p.id}`}>
            <LeaderLine x1={x2 + 5} y1={yMid} x2={rightMargin - 2} y2={yMid} />
            <Label x={rightMargin} y={yMid} text={`${tipo} ${p.top}'-${p.base}'`} />
          </g>
        );
      })}

      {/* Packer labels */}
      {visible.packers && well.packers.map(p => {
        const y = p.depth * config.pxPerFt;
        return (
          <g key={`label-pkr-${p.id}`}>
            <Label x={rightMargin} y={y} text={`Packer @ ${p.depth}'`} />
          </g>
        );
      })}

      {/* Nipple labels */}
      {visible.nipples && well.seatNipples.map(n => {
        const y = n.depth * config.pxPerFt;
        const tipo = n.type === 'polished' ? 'N.Pulido' : 'N.Asiento';
        return (
          <g key={`label-nip-${n.id}`}>
            <Label x={rightMargin} y={y} text={`${tipo} ${n.diameter}" @ ${n.depth}'`} />
          </g>
        );
      })}

      {/* Mandrel labels */}
      {visible.mandrels && well.mandrels.map(m => {
        const { x2 } = diameterToX(config, m.diameter);
        const y = m.depth * config.pxPerFt;
        const valvula = m.hasValve ? ' +VGL' : '';
        return (
          <g key={`label-mdr-${m.id}`}>
            <Label x={x2 + config.pulgada + 4} y={y + 6} text={`M${m.segment}${valvula} @ ${m.depth}'`} />
          </g>
        );
      })}

      {/* Yacimiento / Arena labels — left side, hierarchical brackets */}
      {visible.yacimientos && (() => {
        const withYac = well.perforations.filter(p => p.yacimiento);
        if (withYac.length === 0) return null;

        const { x1 } = diameterToX(config, minCasingDiameter);
        const xInterval  = x1 - 6;   // interval text (anchor=end)
        const xArena     = x1 - 42;  // arena bracket spine
        const xYac       = x1 - 80;  // yacimiento bracket spine
        const bracketColor = '#555';

        // Group by yacimiento
        const byYac: Record<string, typeof withYac> = {};
        withYac.forEach(p => {
          const k = p.yacimiento!;
          if (!byYac[k]) byYac[k] = [];
          byYac[k].push(p);
        });

        return Object.entries(byYac).map(([yacName, yacPerfs]) => {
          const yacTop  = Math.min(...yacPerfs.map(p => p.top))  * config.pxPerFt;
          const yacBase = Math.max(...yacPerfs.map(p => p.base)) * config.pxPerFt;
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
              <Label x={xYac - 3} y={yacMid} text={yacName} anchor="end" />

              {Object.entries(byArena).map(([arenaName, aPerfs]) => {
                const aTop  = Math.min(...aPerfs.map(p => p.top))  * config.pxPerFt;
                const aBase = Math.max(...aPerfs.map(p => p.base)) * config.pxPerFt;
                const aMid  = (aTop + aBase) / 2;

                return (
                  <g key={`arena-lbl-${arenaName}`}>
                    {/* Arena bracket (only when arena field is set) */}
                    {arenaName !== '__none__' && (
                      <>
                        <line x1={xArena} y1={aTop}  x2={xArena + 5} y2={aTop}  stroke={bracketColor} strokeWidth={0.7} />
                        <line x1={xArena} y1={aBase} x2={xArena + 5} y2={aBase} stroke={bracketColor} strokeWidth={0.7} />
                        <line x1={xArena} y1={aTop}  x2={xArena}     y2={aBase} stroke={bracketColor} strokeWidth={0.7} />
                        <Label x={xArena - 3} y={aMid} text={arenaName} anchor="end" />
                      </>
                    )}
                    {/* Interval list */}
                    {aPerfs.map(p => {
                      const yMid    = ((p.top + p.base) / 2) * config.pxPerFt;
                      const espesor = p.base - p.top;
                      const xText   = hasArenas ? xInterval : xInterval;
                      return (
                        <Label
                          key={`interval-${p.id}`}
                          x={xText}
                          y={yMid}
                          text={`${p.top}' - ${p.base}' (${espesor}')`}
                          anchor="end"
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
          const y = d * config.pxPerFt;
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
