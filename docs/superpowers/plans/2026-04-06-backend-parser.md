# Backend Parser & Type Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update types to match backend data, create `parseBackendWell` function, and update rendering layers for the new model.

**Architecture:** Modify existing types (TubingSegment, Mandrel, Well, Sleeve), create a parser utility, update 7 rendering components, and update the demo-app editor. All changes backward compatible except Mandrel.hasValve → valveType (breaking, pre-1.0).

**Tech Stack:** TypeScript, React, Vitest

**Spec:** `docs/superpowers/specs/2026-04-06-backend-parser-design.md`

---

## File Map

### New files

| File | Responsibility |
|---|---|
| `packages/react-well-completion/src/utils/parse-backend-well.ts` | `parseBackendWell` + `parseFractionalDiameter` |
| `packages/react-well-completion/src/__tests__/parse-backend-well.test.ts` | Tests for parser |

### Modified files

| File | Change |
|---|---|
| `packages/react-well-completion/src/types/well.ts` | TubingSegment +top/base/weight/grade, Mandrel hasValve→valveType+ptrPsi+flowDiameter, Well +metadata, Sleeve +comment |
| `packages/react-well-completion/src/utils/well-factory.ts` | Update createMandrel default |
| `packages/react-well-completion/src/index.ts` | Export parseBackendWell, parseFractionalDiameter, ParseBackendWellOverrides |
| `packages/react-well-completion/src/components/layers/TubingLayer.tsx` | Support top/base fields |
| `packages/react-well-completion/src/components/simplified/SimplifiedTubingLayer.tsx` | Support top/base fields |
| `packages/react-well-completion/src/components/icons/MandrelIcon.tsx` | hasValve→valveType |
| `packages/react-well-completion/src/components/layers/AccessoriesLayer.tsx` | hasValve→valveType in mandrel section |
| `packages/react-well-completion/src/components/simplified/SimplifiedMandrelLayer.tsx` | hasValve→valveType |
| `packages/react-well-completion/src/components/layers/LabelsLayer.tsx` | hasValve→valveType in mandrel labels |
| `packages/demo-app/src/components/editor/WellEditor.tsx` | Checkbox→select for valveType |
| `packages/demo-app/src/data/example-wells.ts` | Update hasValve→valveType in examples |
| `packages/react-well-completion/src/__tests__/smoke.test.tsx` | Update createMandrel call |

---

## Task 1: Update types

**Files:**
- Modify: `packages/react-well-completion/src/types/well.ts`

- [ ] **Step 1: Update TubingSegment**

In `packages/react-well-completion/src/types/well.ts`, replace the `TubingSegment` interface:

```typescript
export interface TubingSegment {
  id: string;
  segment: number;        // orden del segmento (1, 2, 3...)
  diameter: number;       // pulgadas OD
  length: number;         // pies
  top?: number;           // pies (opcional — si viene del backend)
  base?: number;          // pies (opcional — si viene del backend)
  weight?: number;        // lb/ft
  grade?: string;         // e.g. 'P-110'
}
```

- [ ] **Step 2: Update Mandrel**

Replace the `Mandrel` interface:

```typescript
export interface Mandrel {
  id: string;
  segment: number;
  depth: number;          // pies
  diameter: number;       // pulgadas
  valveType: 'operating' | 'dummy' | null;
  ptrPsi?: number;        // presion de apertura
  flowDiameter?: string;  // diametro de flujo
}
```

- [ ] **Step 3: Update Sleeve**

Replace the `Sleeve` interface:

```typescript
export interface Sleeve {
  id: string;
  depth: number;          // pies
  diameter: number;       // pulgadas
  comment?: string;       // e.g. "Tope de Circulación"
}
```

- [ ] **Step 4: Update Well**

Add `metadata` to the `Well` interface, after the `wire` field:

```typescript
  wire: Wire | null;                // solo BES
  metadata?: Record<string, unknown>;
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/react-well-completion/src/types/well.ts
git commit -m "feat: update types for backend compatibility (TubingSegment, Mandrel, Sleeve, Well)"
```

---

## Task 2: Update all hasValve references to valveType

**Files:**
- Modify: `packages/react-well-completion/src/components/icons/MandrelIcon.tsx`
- Modify: `packages/react-well-completion/src/components/layers/AccessoriesLayer.tsx`
- Modify: `packages/react-well-completion/src/components/simplified/SimplifiedMandrelLayer.tsx`
- Modify: `packages/react-well-completion/src/components/layers/LabelsLayer.tsx`
- Modify: `packages/react-well-completion/src/utils/well-factory.ts`
- Modify: `packages/demo-app/src/components/editor/WellEditor.tsx`
- Modify: `packages/demo-app/src/data/example-wells.ts`
- Modify: `packages/react-well-completion/src/__tests__/smoke.test.tsx`

- [ ] **Step 1: Update MandrelIcon**

In `packages/react-well-completion/src/components/icons/MandrelIcon.tsx`, replace the entire file:

```tsx
/** Mandril de Gas Lift — simbología en L */
interface Props {
  x: number;
  y: number;
  tubingW: number;
  valveType: 'operating' | 'dummy' | null;
  side?: 'right' | 'left';
}

export default function MandrelIcon({ x, y, tubingW, valveType, side = 'right' }: Props) {
  const sw = 3.5;
  const color = valveType === 'operating' ? '#27ae60'
    : valveType === 'dummy' ? '#95a5a6'
    : '#7f8c8d';
  const dashArray = valveType === 'dummy' ? '4,3' : undefined;

  const armLen = 12;
  const legLen = 10;

  const isRight = side === 'right';
  const wallX = isRight ? x + tubingW : x;
  const dir = isRight ? 1 : -1;
  const armEndX = wallX + armLen * dir;
  const legEndY = y - legLen;

  return (
    <g>
      <line
        x1={wallX} y1={y}
        x2={armEndX} y2={y}
        stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={dashArray}
      />
      <line
        x1={armEndX} y1={y}
        x2={armEndX} y2={legEndY}
        stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={dashArray}
      />
    </g>
  );
}
```

- [ ] **Step 2: Update AccessoriesLayer mandrel section**

In `packages/react-well-completion/src/components/layers/AccessoriesLayer.tsx`, find the Mandrels section and change `hasValve={m.hasValve}` to `valveType={m.valveType}`. The mandrel section uses `<MandrelIcon>` — update the prop.

Search for `hasValve={m.hasValve}` and replace with `valveType={m.valveType}`.

Also update the tooltip info line from:
```typescript
const valvula = m.hasValve ? 'Sí' : 'No';
```
to:
```typescript
const valvula = m.valveType === 'operating' ? 'Operativa' : m.valveType === 'dummy' ? 'Dummy' : 'Sin válvula';
```

- [ ] **Step 3: Update SimplifiedMandrelLayer**

In `packages/react-well-completion/src/components/simplified/SimplifiedMandrelLayer.tsx`, replace line:

```typescript
const color = m.hasValve ? '#555' : '#aaa';
```

with:

```typescript
const color = m.valveType === 'operating' ? '#555'
  : m.valveType === 'dummy' ? '#888'
  : '#aaa';
const dashArray = m.valveType === 'dummy' ? '4,3' : undefined;
```

And add `strokeDasharray={dashArray}` to both `<line>` elements.

- [ ] **Step 4: Update LabelsLayer mandrel labels**

In `packages/react-well-completion/src/components/layers/LabelsLayer.tsx`, find line ~214:

```typescript
const valvula = m.hasValve ? ' +VGL' : '';
```

Replace with:

```typescript
const valvula = m.valveType === 'operating' ? ' +VGL'
  : m.valveType === 'dummy' ? ' +Dummy'
  : '';
```

- [ ] **Step 5: Update well-factory.ts createMandrel default**

In `packages/react-well-completion/src/utils/well-factory.ts`, the `createMandrel` function takes `Omit<Mandrel, 'id'>`. No code change needed — callers must now pass `valveType` instead of `hasValve`.

- [ ] **Step 6: Update demo-app example-wells.ts**

In `packages/demo-app/src/data/example-wells.ts`, replace all `hasValve: true` with `valveType: 'operating'` and all `hasValve: false` with `valveType: null`.

- [ ] **Step 7: Update demo-app WellEditor.tsx**

In `packages/demo-app/src/components/editor/WellEditor.tsx`, find the mandrel "Agregar" button (~line 337):

Replace:
```typescript
createMandrel({ segment: well.mandrels.length + 1, depth: 1000, diameter: 4, hasValve: false })
```

With:
```typescript
createMandrel({ segment: well.mandrels.length + 1, depth: 1000, diameter: 4, valveType: null })
```

Find the mandrel table row checkbox (~line 347):

Replace:
```tsx
<td><input type="checkbox" checked={m.hasValve} onChange={e => updateElement('mandrels', m.id, { hasValve: e.target.checked })} /></td>
```

With:
```tsx
<td>
  <select value={m.valveType ?? ''} onChange={e => updateElement('mandrels', m.id, { valveType: e.target.value === '' ? null : e.target.value as 'operating' | 'dummy' })}>
    <option value="">Sin válvula</option>
    <option value="operating">Operativa</option>
    <option value="dummy">Dummy</option>
  </select>
</td>
```

- [ ] **Step 8: Update smoke tests**

In `packages/react-well-completion/src/__tests__/smoke.test.tsx`, if any test uses `hasValve`, update to `valveType`. Check that `createWell` tests still pass since mandrels array is empty by default.

- [ ] **Step 9: Verify all tests pass**

```bash
pnpm --filter @mik3dev/react-well-completion test
```

Expected: All tests pass.

- [ ] **Step 10: Verify lint passes**

```bash
pnpm --filter @mik3dev/react-well-completion lint
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "refactor: replace Mandrel.hasValve with valveType (operating/dummy/null)"
```

---

## Task 3: Update TubingLayer to support top/base

**Files:**
- Modify: `packages/react-well-completion/src/components/layers/TubingLayer.tsx`
- Modify: `packages/react-well-completion/src/components/simplified/SimplifiedTubingLayer.tsx`

- [ ] **Step 1: Update TubingLayer depth calculation**

In `packages/react-well-completion/src/components/layers/TubingLayer.tsx`, replace the `depths` calculation (lines 14-17):

```typescript
const depths = sorted.reduce<{ top: number; base: number }[]>((acc, seg) => {
  const top = acc.length > 0 ? acc[acc.length - 1].base : 0;
  return [...acc, { top, base: top + seg.length }];
}, []);
```

With:

```typescript
const depths = sorted.reduce<{ top: number; base: number }[]>((acc, seg) => {
  if (seg.top != null && seg.base != null) {
    return [...acc, { top: seg.top, base: seg.base }];
  }
  const top = acc.length > 0 ? acc[acc.length - 1].base : 0;
  return [...acc, { top, base: top + seg.length }];
}, []);
```

- [ ] **Step 2: Update SimplifiedTubingLayer**

Apply the same change in `packages/react-well-completion/src/components/simplified/SimplifiedTubingLayer.tsx`. Find the equivalent depth accumulation logic and add the `seg.top != null && seg.base != null` check.

- [ ] **Step 3: Verify app renders**

```bash
pnpm dev
```

Expected: Existing diagrams render exactly as before (example wells use `length` only, no `top`/`base`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: support optional top/base in TubingSegment rendering"
```

---

## Task 4: Create parseBackendWell function

**Files:**
- Create: `packages/react-well-completion/src/utils/parse-backend-well.ts`

- [ ] **Step 1: Create the parser file**

Create `packages/react-well-completion/src/utils/parse-backend-well.ts`:

```typescript
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

/**
 * Parse fractional diameter strings to numbers.
 * "13 3/8\"" → 13.375
 * "9 5/8\""  → 9.625
 * "3.5"      → 3.5
 */
export function parseFractionalDiameter(od: string): number {
  const cleaned = od.replace(/"/g, '').trim();

  // Try pure number first
  const direct = Number(cleaned);
  if (!Number.isNaN(direct)) return direct;

  // Match "whole fraction" pattern: "13 3/8"
  const match = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match) {
    const whole = Number(match[1]);
    const num = Number(match[2]);
    const den = Number(match[3]);
    return whole + num / den;
  }

  // Match fraction only: "3/8"
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
      result.seatNipples.push({
        id: uuid(),
        depth,
        diameter: 0,
        od: 0,
        type: 'regular',
      });
    } else if (tipo === 'manga') {
      result.sleeves.push({
        id: uuid(),
        depth,
        diameter: 0,
        comment: typeof item['Comentario'] === 'string' ? item['Comentario'] as string : undefined,
      });
    } else if (tipo.includes('empacadura')) {
      result.packers.push({
        id: uuid(),
        depth,
        diameter: 0,
      });
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

  // Calculate totalDepth from max base if not provided or zero
  const rawTotalDepth = getNumber(json, 'Profundidad Total');
  const allBases = [
    ...casings.map(c => c.base),
    ...perforations.map(p => p.base),
    ...tubing.map(t => t.base ?? 0),
  ];
  const calculatedDepth = allBases.length > 0 ? Math.max(...allBases) : 0;
  const totalDepth = overrides?.totalDepth ?? (rawTotalDepth > 0 ? rawTotalDepth : calculatedDepth);

  // Lift method mapping
  const rawMethod = getString(json, 'Tipo de Trabajo');
  const liftMethod = overrides?.liftMethod ?? LIFT_METHOD_MAP[rawMethod] ?? 'GL';

  // Collect unmapped keys into metadata
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/react-well-completion/src/utils/parse-backend-well.ts
git commit -m "feat: add parseBackendWell function and parseFractionalDiameter utility"
```

---

## Task 5: Write tests for the parser

**Files:**
- Create: `packages/react-well-completion/src/__tests__/parse-backend-well.test.ts`

- [ ] **Step 1: Create test file**

Create `packages/react-well-completion/src/__tests__/parse-backend-well.test.ts`:

```typescript
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
    expect(well.totalDepth).toBe(15712); // max perforation base
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

  it('distributes EquipoDeFondo by type', () => {
    const well = parseBackendWell(sampleJson);
    expect(well.seatNipples).toHaveLength(1);
    expect(well.seatNipples[0].depth).toBe(281);
    expect(well.sleeves).toHaveLength(1);
    expect(well.sleeves[0].comment).toBe('Tope de Circulación');
    expect(well.packers).toHaveLength(1);
    expect(well.packers[0].depth).toBe(14669);
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
    expect(well.id).toBeDefined();
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
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter @mik3dev/react-well-completion test
```

Expected: All tests pass (smoke tests + parser tests).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: add comprehensive tests for parseBackendWell and parseFractionalDiameter"
```

---

## Task 6: Export parser from library index

**Files:**
- Modify: `packages/react-well-completion/src/index.ts`

- [ ] **Step 1: Add exports to index.ts**

Add to `packages/react-well-completion/src/index.ts`, after the existing factory exports:

```typescript
// Parser
export { parseBackendWell, parseFractionalDiameter } from './utils/parse-backend-well';
export type { ParseBackendWellOverrides } from './utils/parse-backend-well';
```

- [ ] **Step 2: Verify build**

```bash
pnpm build:lib
```

Expected: Build succeeds. `parseBackendWell` and `parseFractionalDiameter` appear in `dist/index.d.ts`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: export parseBackendWell and parseFractionalDiameter from library"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run all checks**

```bash
pnpm --filter @mik3dev/react-well-completion lint
pnpm --filter @mik3dev/react-well-completion test
cd packages/react-well-completion && npx tsc --noEmit && cd ../..
pnpm build:lib
pnpm dev
```

Expected: All pass. App renders existing diagrams correctly.

- [ ] **Step 2: Push**

```bash
git push origin main
```
