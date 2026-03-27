export type LiftMethod = 'BM' | 'BCP' | 'BES' | 'GL';

export interface Casing {
  id: string;
  diameter: number;       // pulgadas OD
  top: number;            // pies
  base: number;           // pies
  isLiner: boolean;
  linerType?: 'slot' | 'shoot';
  weight?: number;            // lb/ft
  grade?: string;             // e.g. 'J-55', 'N-80', 'P-110'
}

export interface TubingSegment {
  id: string;
  segment: number;        // orden del segmento (1, 2, 3...)
  diameter: number;       // pulgadas OD
  length: number;         // pies
}

export interface RodSegment {
  id: string;
  segment: number;
  diameter: number;       // pulgadas
  length: number;         // pies
}

export interface Pump {
  id: string;
  type: LiftMethod;
  depth: number;          // pies (profundidad de asentamiento)
  diameter: number;       // pulgadas
  length: number;         // pies
}

export interface Packer {
  id: string;
  depth: number;          // pies
  diameter: number;       // pulgadas (OD del tubing donde está)
}

export interface SeatNipple {
  id: string;
  depth: number;          // pies
  diameter: number;       // pulgadas
  od: number;             // pulgadas OD
  type: 'regular' | 'polished';
}

export interface Plug {
  id: string;
  depth: number;          // pies
}

export interface GasAnchor {
  id: string;
  depth: number;          // pies
  diameter: number;       // pulgadas
  length: number;         // pies
}

export interface Mandrel {
  id: string;
  segment: number;
  depth: number;          // pies
  diameter: number;       // pulgadas
  hasValve: boolean;      // si tiene válvula GL instalada
}

export interface Sleeve {
  id: string;
  depth: number;          // pies
  diameter: number;       // pulgadas
}

export interface Packing {
  id: string;
  depth: number;          // pies
  diameter: number;       // pulgadas
  od: number;
}

export interface Perforation {
  id: string;
  top: number;            // pies
  base: number;           // pies
  type: 'slot' | 'shoot';
  yacimiento?: string;    // nombre del yacimiento/reservorio
  arena?: string;         // nombre de la arena o sub-zona productora
}

export interface Sand {
  id: string;
  name: string;           // "Arena A", "Arena B", etc.
  segment: number;
  top: number;            // pies
  base: number;           // pies
}

export interface Wire {
  id: string;
  depth: number;          // pies (hasta donde llega el cable BES)
}

export type DiagramOrientation = 'vertical' | 'horizontal';
export type HalfSide = 'right' | 'left';

export interface Well {
  id: string;
  name: string;
  totalDepth: number;         // pies
  totalFreeDepth: number;     // pies
  liftMethod: LiftMethod;
  latitude?: number;
  longitude?: number;
  estacionFlujo?: string;     // Estación de Flujo (EF)
  mesaRotaria?: number;       // Mesa Rotaria — elevación en pies
  orientation?: DiagramOrientation;   // default 'vertical'
  halfSection?: boolean;              // default false
  halfSide?: HalfSide;               // default 'right'
  casings: Casing[];
  tubingString: TubingSegment[];
  rodString: RodSegment[];          // solo BM/BCP
  pump: Pump | null;
  packers: Packer[];
  seatNipples: SeatNipple[];
  plugs: Plug[];
  gasAnchors: GasAnchor[];
  mandrels: Mandrel[];              // solo GL
  sleeves: Sleeve[];
  packings: Packing[];
  perforations: Perforation[];
  sands: Sand[];
  wire: Wire | null;                // solo BES
}

export type LabelCategory =
  | 'casings'
  | 'tubing'
  | 'rods'
  | 'pump'
  | 'perforations'
  | 'sands'
  | 'packers'
  | 'nipples'
  | 'mandrels'
  | 'depths'
  | 'yacimientos'
  | 'wellDetail'
  | 'casingDetail'
  | 'tubingDetail';

export const ALL_LABEL_CATEGORIES: LabelCategory[] = [
  'casings', 'tubing', 'rods', 'pump', 'perforations',
  'sands', 'packers', 'nipples', 'mandrels', 'depths',
  'yacimientos', 'wellDetail', 'casingDetail', 'tubingDetail',
];

export const LABEL_CATEGORIES: { key: LabelCategory; label: string }[] = [
  { key: 'casings', label: 'Casings' },
  { key: 'tubing', label: 'Tubing' },
  { key: 'rods', label: 'Cabillas' },
  { key: 'pump', label: 'Bomba' },
  { key: 'perforations', label: 'Perforaciones' },
  { key: 'sands', label: 'Arenas' },
  { key: 'packers', label: 'Packers' },
  { key: 'nipples', label: 'Niples' },
  { key: 'mandrels', label: 'Mandriles GL' },
  { key: 'depths', label: 'Profundidades' },
  { key: 'yacimientos', label: 'Yacimientos' },
  { key: 'wellDetail', label: 'Detalle de Pozo' },
  { key: 'casingDetail', label: 'Detalle de Casing' },
  { key: 'tubingDetail', label: 'Detalle de Tuberias' },
];
