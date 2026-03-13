import type { DiagramConfig, Well } from '../../../types';
import { diameterToX } from '../../../hooks/use-diagram-config';
import { useTooltip } from '../Tooltip';
import { PackerIcon, NippleIcon, PlugIcon, GasAnchorIcon, SleeveIcon, PackingIcon, MandrelIcon } from '../icons';

interface Props {
  well: Well;
  config: DiagramConfig;
  minCasingDiameter: number;
}

export default function AccessoriesLayer({ well, config, minCasingDiameter }: Props) {
  const { show, move, hide } = useTooltip();

  return (
    <g className="layer-accessories">
      {/* Packers */}
      {well.packers.map((packer) => {
        const y = packer.depth * config.pxPerFt;
        const { x1, x2 } = diameterToX(config, packer.diameter);
        const packerW = config.pulgada * 1.5;
        const packerH = packerW * 1.2; // aspect ratio ~1.2:1

        const info = ['Tipo: Packer', `Profundidad: ${packer.depth} ft`, `Diámetro: ${packer.diameter}"`];

        return (
          <g key={packer.id}
            onMouseEnter={e => show(e, info)}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <PackerIcon x={x1 - packerW} y={y - packerH / 2} width={packerW} height={packerH} side="left" />
            <PackerIcon x={x2} y={y - packerH / 2} width={packerW} height={packerH} side="right" />
          </g>
        );
      })}

      {/* Seat Nipples */}
      {well.seatNipples.map((nipple) => {
        const y = nipple.depth * config.pxPerFt;
        const { x1, x2 } = diameterToX(config, nipple.diameter);
        const nW = config.pulgada * 0.5;
        const nH = nW * 1.5; // taller than wide
        const label = nipple.type === 'polished' ? 'Niple Pulido' : 'Niple de Asiento';

        return (
          <g key={nipple.id}
            onMouseEnter={e => show(e, [label, `Profundidad: ${nipple.depth} ft`, `Diámetro: ${nipple.diameter}"`])}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <NippleIcon x={x1 - nW} y={y - nH / 2} width={nW} height={nH} type={nipple.type} side="left" />
            <NippleIcon x={x2} y={y - nH / 2} width={nW} height={nH} type={nipple.type} side="right" />
          </g>
        );
      })}

      {/* Plugs */}
      {well.plugs.map((plug) => {
        const y = plug.depth * config.pxPerFt;
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
        const y = ga.depth * config.pxPerFt;
        const gaWidth = x2 - x1;
        const h = Math.max(ga.length * config.pxPerFt, gaWidth * 2.5);

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

      {/* Sleeves */}
      {well.sleeves.map((sleeve) => {
        const { x1, x2 } = diameterToX(config, sleeve.diameter);
        const y = sleeve.depth * config.pxPerFt;
        const sleeveWidth = x2 - x1;
        const h = sleeveWidth * 0.8; // slightly wider than tall

        return (
          <g key={sleeve.id}
            onMouseEnter={e => show(e, ['Tipo: Manga', `Profundidad: ${sleeve.depth} ft`, `Diámetro: ${sleeve.diameter}"`])}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <SleeveIcon x={x1} y={y} width={x2 - x1} height={h} />
          </g>
        );
      })}

      {/* Packings */}
      {well.packings.map((pk) => {
        const { x1, x2 } = diameterToX(config, pk.diameter);
        const y = pk.depth * config.pxPerFt;
        const pkW = config.pulgada * 1.2;
        const pkH = pkW * 1; // square-ish

        return (
          <g key={pk.id}
            onMouseEnter={e => show(e, ['Tipo: Empacadura', `Profundidad: ${pk.depth} ft`, `Diámetro: ${pk.diameter}"`])}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <PackingIcon x={x1 - pkW} y={y - pkH / 2} width={pkW} height={pkH} side="left" />
            <PackingIcon x={x2} y={y - pkH / 2} width={pkW} height={pkH} side="right" />
          </g>
        );
      })}

      {/* Mandrels (Gas Lift) */}
      {well.mandrels.map((mandrel) => {
        const { x2 } = diameterToX(config, mandrel.diameter);
        const y = mandrel.depth * config.pxPerFt;
        const mW = config.pulgada * 1.2;
        const mH = mW * 1.5; // taller pocket
        const label = mandrel.hasValve ? 'Mandril + Válvula GL' : 'Mandril (sin válvula)';

        return (
          <g key={mandrel.id}
            onMouseEnter={e => show(e, [label, `#${mandrel.segment}`, `Profundidad: ${mandrel.depth} ft`])}
            onMouseMove={move}
            onMouseLeave={hide}
          >
            <MandrelIcon x={x2 - mW * 0.3} y={y} width={mW} height={mH} hasValve={mandrel.hasValve} />
          </g>
        );
      })}
    </g>
  );
}
