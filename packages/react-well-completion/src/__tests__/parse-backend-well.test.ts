import { describe, it, expect } from 'vitest';
import { parseBackendWell, parseFractionalDiameter } from '../utils/parse-backend-well';

describe('parseFractionalDiameter', () => {
  it('parses whole + fraction: "13 3/8\\""', () => {
    expect(parseFractionalDiameter('13 3/8"')).toBe(13.375);
  });

  it('parses "9 5/8\\""', () => {
    expect(parseFractionalDiameter('9 5/8"')).toBe(9.625);
  });

  it('parses plain number string: "3.5"', () => {
    expect(parseFractionalDiameter('3.5')).toBe(3.5);
  });

  it('parses fraction only: "3/8"', () => {
    expect(parseFractionalDiameter('3/8')).toBe(0.375);
  });

  it('returns 0 for unparseable input', () => {
    expect(parseFractionalDiameter('abc')).toBe(0);
  });
});

describe('parseBackendWell', () => {
  const sampleJson = {
    Pozo: 'VLG3922',
    HUD: 8500,
    'Profundidad Total': 0,
    'Tipo de Trabajo': 'CVGL',
    TDS: 'JOSE 1',
    Comentario: 'Test comment',
    'Fecha Trabajo': '2026-03-10',
    Casing: [
      { OD: '13 3/8"', Weight: 15.5, posicion: 1, 'Base (pies)': 3974, 'Tope (pies)': 0 },
      { OD: '9 5/8"', Grado: 'HC 110', Weight: 53.5, posicion: 2, 'Base (pies)': 14507, 'Tope (pies)': 0 },
    ],
    Liner: [],
    Tubing: [
      { ID: 2.9, OD: 3.5, Grado: 'P-110', Weight: 10.3, posicion: 1, 'Base (pies)': 14712, 'Tope (pies)': 0 },
    ],
    Perforaciones: [
      { Base: 15692, Tope: 15688, posicion: 1, Yacimiento: 'B-4.0' },
      { Base: 15712, Tope: 15698, posicion: 2, Yacimiento: 'B-4.0' },
    ],
    MadrilesValvulas: [
      { 'PTR PSI': 1360, posicion: 1, PROF_TVD_1: 2920, 'Tamaño (pulg)': 1, 'Diámetro flujo': '12/64"' },
      { posicion: 2, PROF_TVD_1: 5562, 'Tipo Válvula': 'Dummy' },
      { posicion: 3, PROF_TVD_1: 7988 },
    ],
    EquipoDeFondo: [
      { Tipo: 'Niple', posicion: 1, 'Profundidad (pies)': 281 },
      { Tipo: 'Manga', posicion: 2, Comentario: 'Tope de Circulación', 'Profundidad (pies)': 13973 },
      { Tipo: 'Empacadura Permanente', posicion: 3, 'Profundidad (pies)': 14669 },
      { Tipo: 'Cuello Flotador', posicion: 4, 'Profundidad (pies)': 16127 },
    ],
  };

  it('parses well name', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.name).toBe('VLG3922');
  });

  it('maps CVGL to GL lift method', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.liftMethod).toBe('GL');
  });

  it('calculates totalDepth from max base when Profundidad Total is 0', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.totalDepth).toBeGreaterThan(0);
    expect(well.totalDepth).toBe(15712);
  });

  it('uses override totalDepth when provided', () => {
    const well = parseBackendWell(sampleJson, { totalDepth: 20000 });
    expect(well.totalDepth).toBe(20000);
  });

  it('uses override liftMethod when provided', () => {
    const well = parseBackendWell(sampleJson, { liftMethod: 'BM' });
    expect(well.liftMethod).toBe('BM');
  });

  it('parses casings with fractional diameters', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.casings).toHaveLength(2);
    expect(well.casings[0].diameter).toBe(13.375);
    expect(well.casings[1].diameter).toBe(9.625);
    expect(well.casings[0].weight).toBe(15.5);
    expect(well.casings[1].grade).toBe('HC 110');
  });

  it('parses tubing with top/base', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.tubingString).toHaveLength(1);
    expect(well.tubingString[0].top).toBe(0);
    expect(well.tubingString[0].base).toBe(14712);
    expect(well.tubingString[0].length).toBe(14712);
    expect(well.tubingString[0].diameter).toBe(3.5);
  });

  it('parses perforations', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.perforations).toHaveLength(2);
    expect(well.perforations[0].top).toBe(15688);
    expect(well.perforations[0].yacimiento).toBe('B-4.0');
  });

  it('parses mandrels with correct valveType', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.mandrels).toHaveLength(3);
    expect(well.mandrels[0].valveType).toBe('operating');
    expect(well.mandrels[0].ptrPsi).toBe(1360);
    expect(well.mandrels[1].valveType).toBe('dummy');
    expect(well.mandrels[2].valveType).toBeNull();
  });

  it('assigns tubing diameter to mandrels (not Tamaño)', () => {
    const well = parseBackendWell(sampleJson);
    // All mandreles are at depths within the tubing (0-14712), so diameter should be 3.5
    expect(well.mandrels[0].diameter).toBe(3.5);
    expect(well.mandrels[1].diameter).toBe(3.5);
    expect(well.mandrels[2].diameter).toBe(3.5);
  });

  it('stores Tamaño (pulg) as valveDiameter on mandrels', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.mandrels[0].valveDiameter).toBe(1);   // Tamaño: 1
    expect(well.mandrels[1].valveDiameter).toBeUndefined(); // sin Tamaño
    expect(well.mandrels[2].valveDiameter).toBeUndefined(); // sin Tamaño
  });

  it('distributes EquipoDeFondo by type', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.seatNipples).toHaveLength(1);
    expect(well.seatNipples[0].depth).toBe(281);
    expect(well.sleeves).toHaveLength(1);
    expect(well.sleeves[0].comment).toBe('Tope de Circulación');
    expect(well.packers).toHaveLength(1);
    expect(well.packers[0].depth).toBe(14669);
  });

  it('assigns tubing diameter to EquipoDeFondo items at tubing depths', () => {
    const well = parseBackendWell(sampleJson);
    // Niple @ 281 — within tubing (0-14712) → 3.5
    expect(well.seatNipples[0].diameter).toBe(3.5);
    expect(well.seatNipples[0].od).toBe(3.5);
    // Manga @ 13973 — within tubing → 3.5
    expect(well.sleeves[0].diameter).toBe(3.5);
    // Empacadura Permanente @ 14669 — below tubing base (14712) — but still within since 14669 < 14712 → 3.5
    expect(well.packers[0].diameter).toBe(3.5);
  });

  it('falls back to first tubing segment diameter when depth is outside any segment', () => {
    const jsonWithDeepItem = {
      ...sampleJson,
      EquipoDeFondo: [
        { Tipo: 'Empacadura Permanente', posicion: 1, 'Profundidad (pies)': 20000 },
      ],
    };
    const well = parseBackendWell(jsonWithDeepItem);
    expect(well.packers[0].diameter).toBe(3.5); // first tubing segment as fallback
  });

  it('puts Cuello Flotador in metadata.equipoDeFondoExtra', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.metadata).toBeDefined();
    const extras = well.metadata!['equipoDeFondoExtra'] as Record<string, unknown>[];
    expect(extras).toHaveLength(1);
    expect(extras[0]['Tipo']).toBe('Cuello Flotador');
  });

  it('puts unmapped fields in metadata', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.metadata!['TDS']).toBe('JOSE 1');
    expect(well.metadata!['Comentario']).toBe('Test comment');
    expect(well.metadata!['Fecha Trabajo']).toBe('2026-03-10');
  });

  it('generates unique IDs', () => {
    const well = parseBackendWell(sampleJson);
    const allIds = [
      well.id,
      ...well.casings.map(c => c.id),
      ...well.tubingString.map(t => t.id),
      ...well.mandrels.map(m => m.id),
    ];
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
  });
});
