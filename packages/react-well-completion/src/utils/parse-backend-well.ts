import { v4 as uuid } from 'uuid';
import type { Well, LiftMethod, Casing, TubingSegment, Mandrel, Perforation, SeatNipple, Sleeve, Packer } from '../types';

export interface ParseBackendWellOverrides {
  totalDepth?: number;
  liftMethod?: LiftMethod;
}

const LIFT_METHOD_MAP: Record<string, LiftMethod> = {
  CVGL: 'GL',
  BME: 'BM',
  BCP: 'BCP',
  BES: 'BES',
  GL: 'GL',
  BM: 'BM',
};

export function parseFractionalDiameter(od: string): number {
  const cleaned = od.replace(/"/g, '').trim();
  const direct = Number(cleaned);
  if (!Number.isNaN(direct)) return direct;

  const match = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match) {
    return Number(match[1]) + Number(match[2]) / Number(match[3]);
  }

  const fracMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    return Number(fracMatch[1]) / Number(fracMatch[2]);
  }

  return 0;
}

function getString(obj: Record<string, unknown>, key: string): string {
  const val = obj[key];
  return typeof val === 'string' ? val : '';
}

function getNumber(obj: Record<string, unknown>, key: string): number {
  const val = obj[key];
  return typeof val === 'number' ? val : 0;
}

function getArray(obj: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const val = obj[key];
  return Array.isArray(val) ? val as Record<string, unknown>[] : [];
}

function parseCasings(raw: Record<string, unknown>[], isLiner: boolean): Casing[] {
  return raw.map(c => {
    const odRaw = c['OD'];
    const diameter = typeof odRaw === 'string' ? parseFractionalDiameter(odRaw) : getNumber(c, 'OD');
    return {
      id: uuid(),
      diameter,
      top: getNumber(c, 'Tope (pies)'),
      base: getNumber(c, 'Base (pies)'),
      isLiner,
      weight: typeof c['Weight'] === 'number' ? c['Weight'] : undefined,
      grade: typeof c['Grado'] === 'string' ? c['Grado'] : undefined,
    };
  });
}

function parseTubing(raw: Record<string, unknown>[]): TubingSegment[] {
  return raw.map(t => {
    const odRaw = t['OD'];
    const diameter = typeof odRaw === 'string' ? parseFractionalDiameter(odRaw) : getNumber(t, 'OD');
    const top = getNumber(t, 'Tope (pies)');
    const base = getNumber(t, 'Base (pies)');
    return {
      id: uuid(),
      segment: getNumber(t, 'posicion'),
      diameter,
      length: base - top,
      top,
      base,
      weight: typeof t['Weight'] === 'number' ? t['Weight'] : undefined,
      grade: typeof t['Grado'] === 'string' ? t['Grado'] : undefined,
    };
  });
}

function parsePerforations(raw: Record<string, unknown>[]): Perforation[] {
  return raw.map(p => ({
    id: uuid(),
    top: getNumber(p, 'Tope'),
    base: getNumber(p, 'Base'),
    type: 'shoot' as const,
    yacimiento: typeof p['Yacimiento'] === 'string' ? p['Yacimiento'] : undefined,
  }));
}

function parseMandrels(raw: Record<string, unknown>[]): Mandrel[] {
  return raw.map(m => {
    const hasPtr = typeof m['PTR PSI'] === 'number';
    const isDummy = typeof m['Tipo Válvula'] === 'string'
      && (m['Tipo Válvula'] as string).toLowerCase() === 'dummy';

    const valveType: 'operating' | 'dummy' | null =
      hasPtr ? 'operating' : isDummy ? 'dummy' : null;

    return {
      id: uuid(),
      segment: getNumber(m, 'posicion'),
      depth: getNumber(m, 'PROF_TVD_1'),
      diameter: getNumber(m, 'Tamaño (pulg)'),
      valveType,
      ptrPsi: hasPtr ? m['PTR PSI'] as number : undefined,
      flowDiameter: typeof m['Diámetro flujo'] === 'string' ? m['Diámetro flujo'] as string : undefined,
    };
  });
}

interface EquipoDeFondoResult {
  seatNipples: SeatNipple[];
  sleeves: Sleeve[];
  packers: Packer[];
  extras: Record<string, unknown>[];
}

function parseEquipoDeFondo(raw: Record<string, unknown>[]): EquipoDeFondoResult {
  const result: EquipoDeFondoResult = { seatNipples: [], sleeves: [], packers: [], extras: [] };

  for (const item of raw) {
    const tipo = getString(item, 'Tipo').toLowerCase();
    const depth = getNumber(item, 'Profundidad (pies)');

    if (tipo === 'niple') {
      result.seatNipples.push({ id: uuid(), depth, diameter: 0, od: 0, type: 'regular' });
    } else if (tipo === 'manga') {
      result.sleeves.push({
        id: uuid(),
        depth,
        diameter: 0,
        comment: typeof item['Comentario'] === 'string' ? item['Comentario'] as string : undefined,
      });
    } else if (tipo.includes('empacadura')) {
      result.packers.push({ id: uuid(), depth, diameter: 0 });
    } else {
      result.extras.push(item);
    }
  }

  return result;
}

const MAPPED_KEYS = new Set([
  'Pozo', 'HUD', 'Profundidad Total', 'Tipo de Trabajo',
  'Casing', 'Liner', 'Tubing', 'Perforaciones',
  'MadrilesValvulas', 'EquipoDeFondo',
]);

export function parseBackendWell(
  json: Record<string, unknown>,
  overrides?: ParseBackendWellOverrides,
): Well {
  const casings = [
    ...parseCasings(getArray(json, 'Casing'), false),
    ...parseCasings(getArray(json, 'Liner'), true),
  ];
  const tubing = parseTubing(getArray(json, 'Tubing'));
  const perforations = parsePerforations(getArray(json, 'Perforaciones'));
  const mandrels = parseMandrels(getArray(json, 'MadrilesValvulas'));
  const equipo = parseEquipoDeFondo(getArray(json, 'EquipoDeFondo'));

  const rawTotalDepth = getNumber(json, 'Profundidad Total');
  const allBases = [
    ...casings.map(c => c.base),
    ...perforations.map(p => p.base),
    ...tubing.map(t => t.base ?? 0),
  ];
  const calculatedDepth = allBases.length > 0 ? Math.max(...allBases) : 0;
  const totalDepth = overrides?.totalDepth ?? (rawTotalDepth > 0 ? rawTotalDepth : calculatedDepth);

  const rawMethod = getString(json, 'Tipo de Trabajo');
  const liftMethod = overrides?.liftMethod ?? LIFT_METHOD_MAP[rawMethod] ?? 'GL';

  const metadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(json)) {
    if (!MAPPED_KEYS.has(key)) {
      metadata[key] = value;
    }
  }
  if (equipo.extras.length > 0) {
    metadata['equipoDeFondoExtra'] = equipo.extras;
  }

  return {
    id: uuid(),
    name: getString(json, 'Pozo'),
    totalDepth,
    totalFreeDepth: getNumber(json, 'HUD'),
    liftMethod,
    casings,
    tubingString: tubing,
    rodString: [],
    pump: null,
    packers: equipo.packers,
    seatNipples: equipo.seatNipples,
    plugs: [],
    gasAnchors: [],
    mandrels,
    sleeves: equipo.sleeves,
    packings: [],
    perforations,
    sands: [],
    wire: null,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}
