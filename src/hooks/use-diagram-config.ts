import { useMemo } from 'react';
import type { DiagramConfig, Well } from '../types';

const DIAMETER_SCALE = 40; // divide el ancho entre 40 para obtener px/pulgada

export function useDiagramConfig(
  width: number,
  height: number,
  well: Well | undefined
): DiagramConfig | null {
  return useMemo(() => {
    if (!well || width === 0 || height === 0) return null;

    const casings = well.casings;
    const maxCasingBase = casings.length > 0
      ? Math.max(...casings.map(c => c.base))
      : 0;

    const maxDepth = well.totalDepth > 0
      ? well.totalDepth
      : maxCasingBase;

    if (maxDepth === 0) return null;

    const pulgada = width / DIAMETER_SCALE;
    const pxPerFt = height / maxDepth;
    const centerX = width / 2;

    return { width, height, pulgada, pxPerFt, centerX, maxDepth };
  }, [width, height, well]);
}

/** Calcula x1 y x2 a partir de un diámetro */
export function diameterToX(config: DiagramConfig, diameter: number) {
  const halfWidth = (diameter * config.pulgada) / 2;
  return {
    x1: config.centerX - halfWidth,
    x2: config.centerX + halfWidth,
  };
}
