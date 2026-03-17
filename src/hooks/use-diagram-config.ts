import { useMemo } from 'react';
import type { DiagramConfig, Well } from '../types';

const DIAMETER_SCALE = 40;    // divide el ancho entre 40 para obtener px/pulgada
const DEPTH_GAMMA = 1.5;      // γ>1 → más píxeles para secciones profundas
const MAX_DIAGRAM_WIDTH = 480; // ancho efectivo máximo para escalar diámetros

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

    const orientation = well.orientation ?? 'vertical';
    const halfSection = well.halfSection ?? false;
    const halfSide = well.halfSide ?? 'right';

    const effectiveWidth = Math.min(width, MAX_DIAGRAM_WIDTH);
    const pulgada = effectiveWidth / DIAMETER_SCALE;
    const pxPerFt = height / maxDepth;
    const centerX = width / 2;

    // Legacy: depthToY always maps to Y axis
    const depthToY = (depth: number) =>
      Math.pow(depth / maxDepth, DEPTH_GAMMA) * height;

    // Abstract: depthToPos maps to primary axis
    const depthToPos = orientation === 'vertical'
      ? depthToY
      : (depth: number) => Math.pow(depth / maxDepth, DEPTH_GAMMA) * width;

    // centerLine: center of the secondary axis
    const centerLine = orientation === 'vertical' ? centerX : height / 2;

    // Abstract: diameterToSpan maps to secondary axis
    const diameterToSpan = (diameter: number): { a: number; b: number } => {
      const halfW = (diameter * pulgada) / 2;
      if (halfSection) {
        if (halfSide === 'right') {
          return { a: centerLine, b: centerLine + halfW };
        } else {
          return { a: centerLine - halfW, b: centerLine };
        }
      }
      return { a: centerLine - halfW, b: centerLine + halfW };
    };

    return {
      width, height, pulgada, pxPerFt, centerX, maxDepth, depthToY,
      orientation, halfSection, halfSide, centerLine, depthToPos, diameterToSpan,
    };
  }, [width, height, well]);
}

/** Calcula x1 y x2 a partir de un diámetro — alias backward-compatible de diameterToSpan */
export function diameterToX(config: DiagramConfig, diameter: number) {
  const { a, b } = config.diameterToSpan(diameter);
  return { x1: a, x2: b };
}

const CASING_WALL = 5;
const MIN_CASING_GAP = 12;

/**
 * Calcula posiciones esquemáticas de casings de adentro hacia afuera.
 * Retorna un Map de casing.id → {x1, x2} para lookup rápido.
 * (Legacy — usa centerX directamente)
 */
export function computeCasingPositions(
  casings: { id: string; diameter: number; top: number; base: number }[],
  config: DiagramConfig,
): Map<string, { x1: number; x2: number }> {
  const sorted = [...casings].sort((a, b) => b.diameter - a.diameter);
  const n = sorted.length;
  if (n === 0) return new Map();

  const x1s = new Array<number>(n);
  x1s[n - 1] = config.centerX - (sorted[n - 1].diameter / 2) * config.pulgada;

  for (let i = n - 2; i >= 0; i--) {
    const naturalX1 = config.centerX - (sorted[i].diameter / 2) * config.pulgada;
    const maxX1 = x1s[i + 1] - CASING_WALL - MIN_CASING_GAP;
    x1s[i] = Math.min(naturalX1, maxX1);
  }

  const result = new Map<string, { x1: number; x2: number }>();
  sorted.forEach((c, idx) => {
    const x1 = x1s[idx];
    result.set(c.id, { x1, x2: config.centerX * 2 - x1 });
  });
  return result;
}

/**
 * Calcula posiciones esquemáticas abstractas de casings.
 * Retorna Map de casing.id → {a, b} en el eje secundario.
 */
export function computeCasingSpans(
  casings: { id: string; diameter: number; top: number; base: number }[],
  config: DiagramConfig,
): Map<string, { a: number; b: number }> {
  const sorted = [...casings].sort((a, b) => b.diameter - a.diameter);
  const n = sorted.length;
  if (n === 0) return new Map();

  const cl = config.centerLine;
  const as_ = new Array<number>(n);
  as_[n - 1] = cl - (sorted[n - 1].diameter / 2) * config.pulgada;

  for (let i = n - 2; i >= 0; i--) {
    const naturalA = cl - (sorted[i].diameter / 2) * config.pulgada;
    const maxA = as_[i + 1] - CASING_WALL - MIN_CASING_GAP;
    as_[i] = Math.min(naturalA, maxA);
  }

  const result = new Map<string, { a: number; b: number }>();
  sorted.forEach((c, idx) => {
    const a = as_[idx];
    const b = cl * 2 - a;
    if (config.halfSection) {
      if (config.halfSide === 'right') {
        result.set(c.id, { a: cl, b });
      } else {
        result.set(c.id, { a, b: cl });
      }
    } else {
      result.set(c.id, { a, b });
    }
  });
  return result;
}
