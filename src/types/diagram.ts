export interface DiagramConfig {
  width: number;
  height: number;
  pulgada: number;        // px por pulgada de diámetro
  pxPerFt: number;        // px por pie de profundidad (lineal, para compatibilidad)
  centerX: number;        // centro horizontal del diagrama
  maxDepth: number;       // profundidad máxima a renderizar
  depthToY: (depth: number) => number;  // mapeo no-lineal profundidad → Y
}
