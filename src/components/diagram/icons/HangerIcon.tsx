/**
 * Colgador (hanger) — dos bloques sólidos, uno por lado, que representan
 * la abrazadera donde el liner queda suspendido dentro del casing exterior.
 * Sin barra central. Cada bloque sobresale más allá de la pared del liner.
 *
 *  x1/x2: radio interior del casing (centro de las paredes)
 *  y:     profundidad del top del liner (depthToY)
 *  earW:  extensión lateral más allá de la cara exterior del muro
 *  wall:  grosor del muro (WALL)
 *  h:     altura de cada bloque
 */
interface Props {
  x1: number;
  x2: number;
  y: number;
  earW: number;
  wall: number;
  h: number;
  showLeft?: boolean;
  showRight?: boolean;
}

export default function HangerIcon({ x1, x2, y, earW, wall, h, showLeft = true, showRight = true }: Props) {
  const fill = '#222';
  // Bloque izquierdo: desde cara exterior extendida hasta cara interior de la pared
  const lx = x1 - wall / 2 - earW;
  const lw = earW + wall;
  // Bloque derecho: desde cara interior hasta cara exterior extendida
  const rx = x2 - wall / 2;
  const rw = earW + wall;

  return (
    <g>
      {showLeft && <rect x={lx} y={y} width={lw} height={h} fill={fill} />}
      {showRight && <rect x={rx} y={y} width={rw} height={h} fill={fill} />}
    </g>
  );
}
