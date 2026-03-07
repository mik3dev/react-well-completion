import { v4 as uuid } from 'uuid';
import type { Well, LiftMethod, Casing, TubingSegment, RodSegment, Pump, Packer, SeatNipple, Plug, GasAnchor, Mandrel, Sleeve, Packing, Perforation, Sand, Wire } from '../types';

export const createWell = (name: string, liftMethod: LiftMethod): Well => ({
  id: uuid(),
  name,
  totalDepth: 0,
  totalFreeDepth: 0,
  liftMethod,
  casings: [],
  tubingString: [],
  rodString: [],
  pump: null,
  packers: [],
  seatNipples: [],
  plugs: [],
  gasAnchors: [],
  mandrels: [],
  sleeves: [],
  packings: [],
  perforations: [],
  sands: [],
  wire: null,
});

export const createCasing = (partial: Omit<Casing, 'id'>): Casing => ({
  id: uuid(),
  ...partial,
});

export const createTubingSegment = (partial: Omit<TubingSegment, 'id'>): TubingSegment => ({
  id: uuid(),
  ...partial,
});

export const createRodSegment = (partial: Omit<RodSegment, 'id'>): RodSegment => ({
  id: uuid(),
  ...partial,
});

export const createPump = (partial: Omit<Pump, 'id'>): Pump => ({
  id: uuid(),
  ...partial,
});

export const createPacker = (partial: Omit<Packer, 'id'>): Packer => ({
  id: uuid(),
  ...partial,
});

export const createSeatNipple = (partial: Omit<SeatNipple, 'id'>): SeatNipple => ({
  id: uuid(),
  ...partial,
});

export const createPlug = (partial: Omit<Plug, 'id'>): Plug => ({
  id: uuid(),
  ...partial,
});

export const createGasAnchor = (partial: Omit<GasAnchor, 'id'>): GasAnchor => ({
  id: uuid(),
  ...partial,
});

export const createMandrel = (partial: Omit<Mandrel, 'id'>): Mandrel => ({
  id: uuid(),
  ...partial,
});

export const createSleeve = (partial: Omit<Sleeve, 'id'>): Sleeve => ({
  id: uuid(),
  ...partial,
});

export const createPacking = (partial: Omit<Packing, 'id'>): Packing => ({
  id: uuid(),
  ...partial,
});

export const createPerforation = (partial: Omit<Perforation, 'id'>): Perforation => ({
  id: uuid(),
  ...partial,
});

export const createSand = (partial: Omit<Sand, 'id'>): Sand => ({
  id: uuid(),
  ...partial,
});

export const createWire = (partial: Omit<Wire, 'id'>): Wire => ({
  id: uuid(),
  ...partial,
});
