import type { DiagramConfig, Well, LabelCategory } from 'react-well-completion';
import { diameterToX, computeCasingPositions } from 'react-well-completion';

interface Props {
  well: Well;
  config: DiagramConfig;
  minCasingDiameter: number;
  visible: Record<LabelCategory, boolean>;
}

const FONT_SIZE = 9;
const LABEL_COLOR = '#444';
const LINE_COLOR = '#bbb';

function Label({ x, y, text, anchor = 'start', bg = false, rotate = 0 }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; bg?: boolean; rotate?: number }) {
  const charW = FONT_SIZE * 0.42;
  const pad = 2;
  const w = text.length * charW + pad * 2;
  const h = FONT_SIZE + pad * 2;
  const rx = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  const t = rotate ? `rotate(${rotate}, ${x}, ${y})` : undefined;
  return (
    <g transform={t}>
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

export default function LabelsLayer({ well, config, minCasingDiameter, visible }: Props) {
  const isH = config.orientation === 'horizontal';
  const rot = 0; // No counter-rotation: in horizontal mode, group rotation makes text read bottom-to-top

  const { width } = config;
  // Use same margins for both orientations — rotation handles placement.
  // Labels at rightMargin appear "to the right" in vertical, "above" in horizontal.
  const rightMargin = width + 8;
  const leftMargin = -8;

  return (
    <g className="layer-labels">
      {/* Casing labels — right side (skip in horizontal: inline labels from CasingLayer suffice) */}
      {visible.casings && !isH && well.casings.map(c => {
        const { x2 } = diameterToX(config, c.diameter);
        const yTop = config.depthToPos(c.top);
        const yBase = config.depthToPos(c.base);
        const yMid = (yTop + yBase) / 2;
        const label = `${c.diameter}" ${c.isLiner ? 'Liner' : 'Csg'}`;
        // In horizontal, combine into one label to avoid overlap
        const showDepths = !isH || (yBase - yTop > 40);

        return (
          <g key={`label-csg-${c.id}`}>
            <LeaderLine x1={x2 + 5} y1={yMid} x2={rightMargin - 2} y2={yMid} />
            <Label rotate={rot} x={rightMargin} y={yMid} text={isH ? `${label} ${c.top}'-${c.base}'` : label} />
            {showDepths && (
              <>
                <Label rotate={rot} x={rightMargin} y={yTop + FONT_SIZE + 2} text={`${c.top}'`} />
                <Label rotate={rot} x={rightMargin} y={yBase - 2} text={`${c.base}'`} />
              </>
            )}
          </g>
        );
      })}

      {/* Tubing labels — left side (skip in horizontal — too dense) */}
      {visible.tubing && (() => {
        let acc = 0;
        return well.tubingString
          .slice().sort((a, b) => a.segment - b.segment)
          .map(t => {
            const top = acc;
            acc += t.length;
            const base = acc;
            const { x1 } = diameterToX(config, t.diameter);
            const yMid = (config.depthToPos(top) + config.depthToPos(base)) / 2;

            return (
              <g key={`label-tbg-${t.id}`}>
                <LeaderLine x1={x1 - 5} y1={yMid} x2={leftMargin + 2} y2={yMid} />
                <Label rotate={rot} x={leftMargin} y={yMid - 5} text={`Tbg ${t.diameter}"`} anchor="end" />
                <Label rotate={rot} x={leftMargin} y={yMid + 5} text={`${t.length} ft`} anchor="end" />
              </g>
            );
          });
      })()}

      {/* Rod labels — left side, offset further (skip in horizontal) */}
      {visible.rods && (() => {
        let acc = 0;
        return well.rodString
          .slice().sort((a, b) => a.segment - b.segment)
          .map(r => {
            const top = acc;
            acc += r.length;
            const base = acc;
            const yMid = (config.depthToPos(top) + config.depthToPos(base)) / 2;

            return (
              <g key={`label-rod-${r.id}`}>
                <Label rotate={rot} x={leftMargin - 50} y={yMid} text={`Rod ${r.diameter}" ${r.length}ft`} anchor="end" />
              </g>
            );
          });
      })()}

      {/* Pump label (skip in horizontal) */}
      {visible.pump && !isH && well.pump && (() => {
        const y = config.depthToPos(well.pump.depth);
        const labels: Record<string, string> = {
          BM: 'B. Mecánica',
          BCP: 'BCP',
          BES: 'BES',
          GL: 'Gas Lift',
        };
        return (
          <g>
            <Label rotate={rot} x={rightMargin} y={y} text={`${labels[well.pump.type]} @ ${well.pump.depth}'`} />
          </g>
        );
      })()}

      {/* Sand labels — left side (skip in horizontal — too dense) */}
      {visible.sands && well.sands.map(s => {
        const { x1 } = diameterToX(config, minCasingDiameter);
        const yMid = (config.depthToPos(s.top) + config.depthToPos(s.base)) / 2;
        return (
          <g key={`label-sand-${s.id}`}>
            <LeaderLine x1={0} y1={yMid} x2={x1 - 5} y2={yMid} />
            {isH ? (
              <Label rotate={rot} x={4} y={yMid} text={`${s.name} ${s.top}' - ${s.base}'`} />
            ) : (
              <>
                <Label rotate={rot} x={4} y={yMid - 5} text={s.name} />
                <Label rotate={rot} x={4} y={yMid + 5} text={`${s.top}' - ${s.base}'`} />
              </>
            )}
          </g>
        );
      })}

      {/* Perforation labels — right side (skip in horizontal: yacimiento brackets show interval info) */}
      {visible.perforations && !isH && (() => {
        const MIN_SPACING = FONT_SIZE + 4;
        const sorted = [...well.perforations].sort((a, b) => a.top - b.top);
        let lastY = -Infinity;
        return sorted.map(p => {
          const { x2 } = diameterToX(config, minCasingDiameter);
          let yMid = (config.depthToPos(p.top) + config.depthToPos(p.base)) / 2;
          if (yMid - lastY < MIN_SPACING) yMid = lastY + MIN_SPACING;
          lastY = yMid;
          const tipo = p.type === 'shoot' ? 'Cañ.' : 'Ran.';
          return (
            <g key={`label-perf-${p.id}`}>
              <LeaderLine x1={x2 + 5} y1={yMid} x2={rightMargin - 2} y2={yMid} />
              <Label rotate={rot} x={rightMargin} y={yMid} text={`${tipo} ${p.top}'-${p.base}'`} bg />
            </g>
          );
        });
      })()}

      {/* Packer labels (skip in horizontal) */}
      {visible.packers && !isH && well.packers.map(p => {
        const y = config.depthToPos(p.depth);
        return (
          <g key={`label-pkr-${p.id}`}>
            <Label rotate={rot} x={rightMargin} y={y} text={`Packer @ ${p.depth}'`} />
          </g>
        );
      })}

      {/* Nipple labels (skip in horizontal) */}
      {visible.nipples && !isH && well.seatNipples.map(n => {
        const y = config.depthToPos(n.depth);
        const tipo = n.type === 'polished' ? 'N.Pulido' : 'N.Asiento';
        return (
          <g key={`label-nip-${n.id}`}>
            <Label rotate={rot} x={rightMargin} y={y} text={`${tipo} ${n.diameter}" @ ${n.depth}'`} />
          </g>
        );
      })}

      {/* Mandrel labels — positioned outside the outermost casing */}
      {visible.mandrels && (() => {
        const casingPos = computeCasingPositions(well.casings, config);
        const half = config.halfSection;
        const onLeft = half && config.halfSide === 'left';
        // Always position outside the outermost casing — rotation handles orientation
        let outerX2 = 0;
        let outerX1 = Infinity;
        for (const pos of casingPos.values()) {
          if (pos.x2 > outerX2) outerX2 = pos.x2;
          if (pos.x1 < outerX1) outerX1 = pos.x1;
        }
        const useLeft = onLeft;
        const edge = useLeft ? outerX1 : outerX2;
        return well.mandrels
          .slice().sort((a, b) => a.depth - b.depth)
          .map(m => {
          const y = config.depthToPos(m.depth);
          const valvula = m.hasValve ? ' +VGL' : '';
          return (
            <g key={`label-mdr-${m.id}`}>
              <Label
                rotate={rot}
                x={useLeft ? edge - 8 : edge + 8}
                y={y}
                text={`M${m.segment}${valvula} @ ${m.depth}'`}
                anchor={useLeft ? 'end' : 'start'}
              />
            </g>
          );
        });
      })()}

      {/* Yacimiento / Arena labels — left side, hierarchical brackets (skip in horizontal) */}
      {visible.yacimientos && (() => {
        const withYac = well.perforations.filter(p => p.yacimiento);
        if (withYac.length === 0) return null;

        const { x1, x2 } = diameterToX(config, minCasingDiameter);
        // Layout: casing wall ... interval text ... arena bracket ... yac bracket
        // In half-section right, labels move to the right side of the casing
        const half = config.halfSection;
        const labelsOnRight = half && config.halfSide === 'right';
        const layoutCharW = FONT_SIZE * 0.55;
        const maxIntervalLen = Math.max(...withYac.map(p => `${p.top}' - ${p.base}' (${p.base - p.top}')`.length));
        const intervalTextW = maxIntervalLen * layoutCharW + 8;
        let xInterval: number, xArena: number, xYac: number;
        let anchorDir: 'start' | 'end';
        let bracketDir: number; // +1 = brackets open right, -1 = brackets open left
        if (labelsOnRight) {
          xInterval = x2 + 20;
          xArena    = x2 + intervalTextW + 10;
          xYac      = xArena + 50;
          anchorDir = 'start';
          bracketDir = 1;
        } else {
          xInterval = x1 - 20;
          xArena    = x1 - intervalTextW - 10;
          xYac      = xArena - 50;
          anchorDir = 'end';
          bracketDir = -1;
        }
        const bracketColor = '#555';

        // Group by yacimiento
        const byYac: Record<string, typeof withYac> = {};
        withYac.forEach(p => {
          const k = p.yacimiento!;
          if (!byYac[k]) byYac[k] = [];
          byYac[k].push(p);
        });

        return Object.entries(byYac).map(([yacName, yacPerfs]) => {
          const yacTop  = config.depthToPos(Math.min(...yacPerfs.map(p => p.top)));
          const yacBase = config.depthToPos(Math.max(...yacPerfs.map(p => p.base)));
          const yacMid  = (yacTop + yacBase) / 2;

          // Group by arena within yacimiento
          const byArena: Record<string, typeof yacPerfs> = {};
          yacPerfs.forEach(p => {
            const k = p.arena ?? '__none__';
            if (!byArena[k]) byArena[k] = [];
            byArena[k].push(p);
          });

          return (
            <g key={`yac-lbl-${yacName}`}>
              {/* Yacimiento bracket */}
              <line x1={xYac} y1={yacTop}  x2={xYac - 6 * bracketDir} y2={yacTop}  stroke={bracketColor} strokeWidth={0.8} />
              <line x1={xYac} y1={yacBase} x2={xYac - 6 * bracketDir} y2={yacBase} stroke={bracketColor} strokeWidth={0.8} />
              <line x1={xYac} y1={yacTop}  x2={xYac}     y2={yacBase} stroke={bracketColor} strokeWidth={0.8} />
              <Label rotate={rot} x={xYac + 3 * bracketDir} y={yacMid} text={yacName} anchor={anchorDir} bg />

              {Object.entries(byArena).map(([arenaName, aPerfs]) => {
                const aTop  = config.depthToPos(Math.min(...aPerfs.map(p => p.top)));
                const aBase = config.depthToPos(Math.max(...aPerfs.map(p => p.base)));
                const aMid  = (aTop + aBase) / 2;

                return (
                  <g key={`arena-lbl-${arenaName}`}>
                    {/* Arena bracket (only when arena field is set) */}
                    {arenaName !== '__none__' && (
                      <>
                        <line x1={xArena} y1={aTop}  x2={xArena - 5 * bracketDir} y2={aTop}  stroke={bracketColor} strokeWidth={0.7} />
                        <line x1={xArena} y1={aBase} x2={xArena - 5 * bracketDir} y2={aBase} stroke={bracketColor} strokeWidth={0.7} />
                        <line x1={xArena} y1={aTop}  x2={xArena}     y2={aBase} stroke={bracketColor} strokeWidth={0.7} />
                        <Label rotate={rot} x={xArena + 3 * bracketDir} y={aMid} text={arenaName} anchor={anchorDir} bg />
                      </>
                    )}
                    {/* Interval list */}
                    {aPerfs.map(p => {
                      const yMid    = (config.depthToPos(p.top) + config.depthToPos(p.base)) / 2;
                      const espesor = p.base - p.top;
                      const xText   = xInterval;
                      return (
                        <Label
                          key={`interval-${p.id}`}
                          x={xText}
                          y={yMid}
                          text={`${p.top}' - ${p.base}' (${espesor}')`}
                          anchor={anchorDir}
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
          const y = config.depthToPos(d);
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
