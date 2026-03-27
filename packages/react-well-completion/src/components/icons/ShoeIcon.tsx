/**
 * Zapata de casing — triángulo recto apuntando hacia afuera desde la cara exterior del muro.
 *
 * Para el lado izquierdo:
 *   El ángulo recto queda en la cara exterior del muro (x), el vértice inferior izquierdo
 *   apunta outward. La base es la cara exterior (vertical) y la hipotenusa va de
 *   (x, y) a (x - width, y + height).
 *
 *   x = cara exterior del muro izquierdo (x1 - WALL/2)
 *   x - width = punta exterior (apex)
 *
 * Para el lado derecho: espejo.
 *   x = cara exterior del muro derecho (x2 + WALL/2)
 */
interface Props {
  x: number;      // cara exterior del muro (punto de anclaje)
  y: number;      // inicio vertical del shoe (y + h - shoeH)
  width: number;  // cuánto sobresale hacia afuera (horizontal)
  height: number; // altura vertical del shoe
  side: 'left' | 'right';
}

export default function ShoeIcon({ x, y, width, height, side }: Props) {
  // Left: ángulo recto en (x, y+height), apex en (x-width, y+height)
  //   puntos: cara-exterior-top, cara-exterior-bottom, apex-bottom
  // Right: espejo — ángulo recto en (x, y+height), apex en (x+width, y+height)
  const points = side === 'left'
    ? `${x},${y} ${x},${y + height} ${x - width},${y + height}`
    : `${x},${y} ${x},${y + height} ${x + width},${y + height}`;

  return <polygon points={points} fill="#222" />;
}
