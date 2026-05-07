// Types
export type {
  Well, LiftMethod, DiagramOrientation, HalfSide,
  Casing, TubingSegment, RodSegment, Pump, Packer,
  SeatNipple, Plug, GasAnchor, Mandrel, Sleeve,
  Packing, Perforation, Sand, Wire,
  LabelCategory,
} from './types';
export type { DiagramConfig } from './types';
export type { Profile, ProfilePoint, ProfileLayout } from './types';
export { ALL_LABEL_CATEGORIES, LABEL_CATEGORIES } from './types';
export type { BrandTheme } from './theme';
export { defaultTheme } from './theme';

// Factories
export {
  createWell, createCasing, createTubingSegment,
  createRodSegment, createPump, createPacker,
  createSeatNipple, createPlug, createGasAnchor,
  createMandrel, createSleeve, createPacking,
  createPerforation, createSand, createWire,
} from './utils/well-factory';

// Parser
export { parseBackendWell, parseFractionalDiameter } from './utils/parse-backend-well';
export type { ParseBackendWellOverrides } from './utils/parse-backend-well';

// Hook
export { useDiagramConfig, diameterToX, computeCasingPositions, computeCasingSpans } from './hooks/use-diagram-config';

// Components
export { default as WellDiagram } from './components/WellDiagram';
export type { WellDiagramProps } from './components/WellDiagram';
export { default as SimplifiedDiagram } from './components/simplified/SimplifiedDiagram';
export type { SimplifiedDiagramProps } from './components/simplified/SimplifiedDiagram';
