import type { DiagramConfig, TubingSegment, Well } from '../../types';
import { diameterToX, computeCasingPositions } from '../../hooks/use-diagram-config';
import { useTooltip } from '../tooltip-context';
import { PackerIcon, NippleIcon, PlugIcon, GasAnchorIcon, SleeveIcon, PackingIcon, MandrelIcon } from '../icons';

interface Props {
  well: Well;
  config: DiagramConfig;
  minCasingDiameter: number;
}

/**
 * Resuelve el diametro a usar para posicionar un accesorio de fondo.
 * Si el componente trae diameter > 0, lo usa. Si es 0 (dato faltante),
 * busca el diametro del tubing a esa profundidad.
 */
function resolveDiameter(
  componentDiameter: number,
  depth: number,
  tubing: TubingSegment[],
): number {
  if (componentDiameter > 0) return componentDiameter;
  if (tubing.length === 0) return 0;

  const seg = tubing.find(t =>
    t.top != null && t.base != null && depth >= t.top && depth <= t.base,
  );
  if (seg) return seg.diameter;
  return tubing[0].diameter;
}

export default function AccessoriesLayer({ well, config, minCasingDiameter }: Props) {
  const { show, move, hide } = useTooltip();
  const half = config.halfSection;
  const showLeft = !half || config.halfSide === 'left';
  const showRight = !half || config.halfSide === 'right';

  return (
    <g className="layer-accessories">
      {/* Packers */}
      {well.packers.map((packer) => {
        const y = config.depthToPos(packer.depth);
        const effectiveDiameter = resolveDiameter(packer.diameter, packer.depth, well.tubingString);
        const { x1, x2 } = diameterToX(config, effectiveDiameter);
        const packerW = config.pulgada * 1.5;
        const packerH = packerW * 1.2; // aspect ratio ~1.2:1

        const info = ['Tipo: Packer', `Profundidad: ${packer.depth} ft`, `Diámetro: ${effectiveDiameter}"`];

        return (
          <g key={packer.id}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            {showLeft && <PackerIcon x={x1 - packerW} y={y - packerH / 2} width={packerW} height={packerH} side="left" />}
            {showRight && <PackerIcon x={x2} y={y - packerH / 2} width={packerW} height={packerH} side="right" />}
          </g>
        );
      })}

      {/* Seat Nipples */}
      {well.seatNipples.map((nipple) => {
        const y = config.depthToPos(nipple.depth);
        const effectiveDiameter = resolveDiameter(nipple.diameter, nipple.depth, well.tubingString);
        const { x1, x2 } = diameterToX(config, effectiveDiameter);
        const nW = config.pulgada * 0.5;
        const nH = nW * 1.5; // taller than wide
        const label = nipple.type === 'polished' ? 'Niple Pulido' : 'Niple de Asiento';

        return (
          <g key={nipple.id}
            onMouseEnter={e => show(e, [label, `Profundidad: ${nipple.depth} ft`, `Diámetro: ${effectiveDiameter}"`])}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            {showLeft && <NippleIcon x={x1 - nW} y={y - nH / 2} width={nW} height={nH} type={nipple.type} side="left" />}
            {showRight && <NippleIcon x={x2} y={y - nH / 2} width={nW} height={nH} type={nipple.type} side="right" />}
          </g>
        );
      })}

      {/* Plugs */}
      {well.plugs.map((plug) => {
        const y = config.depthToPos(plug.depth);
        const { x1, x2 } = diameterToX(config, minCasingDiameter);
        const plugH = config.pulgada * 0.6;

        return (
          <g key={plug.id}
            onMouseEnter={e => show(e, ['Tipo: Tapón', `Profundidad: ${plug.depth} ft`])}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <PlugIcon x={x1} y={y} width={x2 - x1} height={plugH} />
          </g>
        );
      })}

      {/* Gas Anchors */}
      {well.gasAnchors.map((ga) => {
        const { x1, x2 } = diameterToX(config, ga.diameter);
        const y = config.depthToPos(ga.depth);
        const scaledH = ga.length > 0 ? config.depthToPos(ga.depth + ga.length) - y : 0;
        const h = Math.max(scaledH, 20);

        return (
          <g key={ga.id}
            onMouseEnter={e => show(e, ['Tipo: Ancla de Gas', `Profundidad: ${ga.depth} ft`, `Diámetro: ${ga.diameter}"`])}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <GasAnchorIcon x={x1} y={y} width={x2 - x1} height={h} />
          </g>
        );
      })}

      {/* Sleeves — uniform height, full tubing width */}
      {well.sleeves.map((sleeve) => {
        const effectiveDiameter = resolveDiameter(sleeve.diameter, sleeve.depth, well.tubingString);
        const { x1, x2 } = diameterToX(config, effectiveDiameter);
        const y = config.depthToPos(sleeve.depth);
        const SLEEVE_H = config.pulgada * 0.6;

        const info = sleeve.comment
          ? ['Tipo: Manga', `Profundidad: ${sleeve.depth} ft`, `Diámetro: ${effectiveDiameter}"`, sleeve.comment]
          : ['Tipo: Manga', `Profundidad: ${sleeve.depth} ft`, `Diámetro: ${effectiveDiameter}"`];

        return (
          <g key={sleeve.id}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <SleeveIcon x={x1} y={y - SLEEVE_H / 2} width={x2 - x1} height={SLEEVE_H} />
          </g>
        );
      })}

      {/* Packings — span from tubing outer wall to containing casing inner wall */}
      {(() => {
        const PK_H = config.pulgada * 0.8;
        const WALL = 5;
        const casingPos = computeCasingPositions(well.casings, config);
        return well.packings.map((pk) => {
          const effectiveDiameter = resolveDiameter(pk.diameter, pk.depth, well.tubingString);
          const { x1: tbgX1, x2: tbgX2 } = diameterToX(config, effectiveDiameter);
          const y = config.depthToPos(pk.depth);

          // Find the smallest casing that contains this packing at pk.depth
          const containingCasing = well.casings
            .filter(c => c.top <= pk.depth && c.base >= pk.depth)
            .sort((a, b) => a.diameter - b.diameter)[0];

          // Use schematic casing position (matches CasingLayer rendering)
          let csgX1: number, csgX2: number;
          if (containingCasing) {
            const pos = casingPos.get(containingCasing.id)!;
            csgX1 = pos.x1;
            csgX2 = pos.x2;
          } else {
            const fallback = diameterToX(config, pk.od || effectiveDiameter + 2);
            csgX1 = fallback.x1;
            csgX2 = fallback.x2;
          }

          const pkWL = tbgX1 - (csgX1 + WALL / 2);
          const pkWR = (csgX2 - WALL / 2) - tbgX2;

          return (
            <g key={pk.id}
              onMouseEnter={e => show(e, ['Tipo: Empacadura', `Profundidad: ${pk.depth} ft`, `Diámetro: ${effectiveDiameter}"`])}
              onMouseMove={move}
              onMouseLeave={hide}
            >
              {showLeft && <PackingIcon x={csgX1 + WALL / 2} y={y - PK_H / 2} width={Math.max(pkWL, 4)} height={PK_H} side="left" />}
              {showRight && <PackingIcon x={tbgX2} y={y - PK_H / 2} width={Math.max(pkWR, 4)} height={PK_H} side="right" />}
            </g>
          );
        });
      })()}

      {/* Mandrels (Gas Lift) — side-pocket on right side of tubing */}
      {well.mandrels.map((mandrel) => {
        const effectiveDiameter = resolveDiameter(mandrel.diameter, mandrel.depth, well.tubingString);
        const { x1, x2 } = diameterToX(config, effectiveDiameter);
        const y = config.depthToPos(mandrel.depth);
        const label = mandrel.valveType === 'operating' ? 'Mandril + Válvula GL' : mandrel.valveType === 'dummy' ? 'Mandril + Válvula Dummy' : 'Mandril (sin válvula)';

        const info = [label, `#${mandrel.segment}`, `Profundidad: ${mandrel.depth} ft`];
        if (mandrel.valveDiameter != null) {
          info.push(`Diám. Válvula: ${mandrel.valveDiameter}"`);
        }
        if (mandrel.ptrPsi != null) {
          info.push(`PTR: ${mandrel.ptrPsi} psi`);
        }
        if (mandrel.flowDiameter) {
          info.push(`Diám. Flujo: ${mandrel.flowDiameter}`);
        }

        return (
          <g key={mandrel.id}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <MandrelIcon x={x1} y={y} tubingW={x2 - x1} valveType={mandrel.valveType} side={half ? config.halfSide : 'right'} />
          </g>
        );
      })}
    </g>
  );
}
