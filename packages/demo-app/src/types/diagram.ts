import type { DiagramOrientation, HalfSide } from './well';

export interface DiagramConfig {
  width: number;
  height: number;
  pulgada: number;        // px por pulgada de diámetro
  pxPerFt: number;        // px por pie de profundidad (lineal, para compatibilidad)
  centerX: number;        // centro horizontal del diagrama (backward compat)
  maxDepth: number;       // profundidad máxima a renderizar
  depthToY: (depth: number) => number;  // mapeo no-lineal profundidad → Y (backward compat)

  // Abstract coordinate system
  orientation: DiagramOrientation;
  halfSection: boolean;
  halfSide: HalfSide;
  centerLine: number;     // centro del eje secundario (centerX en vertical, centerY en horizontal)
  depthToPos: (depth: number) => number;                   // depth → eje primario
  diameterToSpan: (diameter: number) => { a: number; b: number }; // diameter → eje secundario
}
