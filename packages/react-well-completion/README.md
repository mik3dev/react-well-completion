# @mik3dev/react-well-completion

React components for rendering oil & gas well completion diagrams as SVG.

Supports 4 lift methods: **BM** (Beam Pump), **BCP** (Progressing Cavity Pump), **BES** (Electric Submersible Pump), **GL** (Gas Lift).

## Installation

```bash
npm install @mik3dev/react-well-completion
```

> Published to GitHub Packages. Configure your `.npmrc`:
> ```
> @mik3dev:registry=https://npm.pkg.github.com
> ```

## Quick Start

```tsx
import { WellDiagram, createWell } from '@mik3dev/react-well-completion';

const well = createWell('Pozo-001', 'BM');

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <WellDiagram well={well} />
    </div>
  );
}
```

## Components

| Component | Description |
|---|---|
| `WellDiagram` | Full detailed diagram with labels, detail tables, and tooltips |
| `SimplifiedDiagram` | Grayscale schematic diagram, ideal for reports and printing |

### WellDiagram Props

```tsx
interface WellDiagramProps {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;
  theme?: Partial<BrandTheme>;
}
```

### SimplifiedDiagram Props

```tsx
interface SimplifiedDiagramProps {
  well: Well;
}
```

## Building a Well

Use factory functions — they auto-generate UUIDs:

```tsx
import {
  createWell,
  createCasing,
  createTubingSegment,
  createPump,
  createPerforation,
  createMandrel,
} from '@mik3dev/react-well-completion';

const well = {
  ...createWell('Pozo-001', 'BM'),
  totalDepth: 5000,
  totalFreeDepth: 4800,
  casings: [
    createCasing({ diameter: 9.625, top: 0, base: 3000, isLiner: false, weight: 47, grade: 'N-80' }),
    createCasing({ diameter: 7, top: 0, base: 5000, isLiner: false, weight: 26, grade: 'J-55' }),
  ],
  tubingString: [
    createTubingSegment({ segment: 1, diameter: 3.5, length: 3000 }),
    createTubingSegment({ segment: 2, diameter: 2.875, length: 1500 }),
  ],
  pump: createPump({ type: 'BM', depth: 4500, diameter: 2.5, length: 50 }),
  perforations: [
    createPerforation({ top: 4600, base: 4700, type: 'shoot', yacimiento: 'Fm. Oficina' }),
  ],
};
```

### Gas Lift with Mandrels

```tsx
const glWell = {
  ...createWell('GL-003', 'GL'),
  totalDepth: 8000,
  totalFreeDepth: 7500,
  casings: [/* ... */],
  tubingString: [/* ... */],
  mandrels: [
    createMandrel({ segment: 1, depth: 2000, diameter: 1, valveType: 'operating' }),
    createMandrel({ segment: 2, depth: 3500, diameter: 1, valveType: 'operating' }),
    createMandrel({ segment: 3, depth: 5000, diameter: 1, valveType: 'dummy' }),
    createMandrel({ segment: 4, depth: 6500, diameter: 1, valveType: null }),
  ],
};
```

`valveType` values:
- `'operating'` — Active gas lift valve (green icon)
- `'dummy'` — Dummy valve (dashed gray icon)
- `null` — Mandrel without valve

## Parsing Backend Data

If your backend returns well data in raw format (Spanish field names, fractional diameter strings, etc.), use `parseBackendWell`:

```tsx
import { WellDiagram, parseBackendWell } from '@mik3dev/react-well-completion';

async function WellViewer({ wellId }) {
  const response = await fetch(`/api/wells/${wellId}`);
  const json = await response.json();

  // Convert raw backend JSON to a typed Well object
  const well = parseBackendWell(json);

  return <WellDiagram well={well} />;
}
```

### Backend Format Example

The parser expects JSON like this:

```json
{
  "Pozo": "VLG3922",
  "HUD": 8500,
  "Profundidad Total": 0,
  "Tipo de Trabajo": "CVGL",
  "Casing": [
    { "OD": "13 3/8\"", "Weight": 15.5, "Tope (pies)": 0, "Base (pies)": 3974 }
  ],
  "Liner": [
    { "OD": "7\"", "Tope (pies)": 13900, "Base (pies)": 16127 }
  ],
  "Tubing": [
    { "OD": 3.5, "Grado": "P-110", "Tope (pies)": 0, "Base (pies)": 14712 }
  ],
  "Perforaciones": [
    { "Tope": 15688, "Base": 15692, "Yacimiento": "B-4.0" }
  ],
  "MadrilesValvulas": [
    { "PTR PSI": 1360, "PROF_TVD_1": 2920, "Tamaño (pulg)": 1 },
    { "PROF_TVD_1": 5562, "Tipo Válvula": "Dummy" }
  ],
  "EquipoDeFondo": [
    { "Tipo": "Niple", "Profundidad (pies)": 281 },
    { "Tipo": "Manga", "Comentario": "Tope de Circulación", "Profundidad (pies)": 13973 },
    { "Tipo": "Empacadura Permanente", "Profundidad (pies)": 14669 }
  ]
}
```

### What the Parser Does

| Backend field | Maps to | Notes |
|---|---|---|
| `Pozo` | `well.name` | |
| `HUD` | `well.totalFreeDepth` | |
| `Profundidad Total` | `well.totalDepth` | If `0`, calculated from max base of casings/perforations/tubing |
| `Tipo de Trabajo` | `well.liftMethod` | Mapped: `CVGL→GL`, `BME→BM`, etc. |
| `Casing[]` + `Liner[]` | `well.casings` | Liners merged with `isLiner: true` |
| OD strings like `"13 3/8\""` | `casing.diameter` | Parsed to `13.375` |
| `Tubing[]` | `well.tubingString` | With explicit `top`/`base` |
| `Perforaciones[]` | `well.perforations` | |
| `MadrilesValvulas[]` | `well.mandrels` | `valveType` inferred from `PTR PSI` / `Tipo Válvula` |
| `EquipoDeFondo` type `Niple` | `well.seatNipples` | |
| `EquipoDeFondo` type `Manga` | `well.sleeves` | With `comment` from `Comentario` |
| `EquipoDeFondo` type `Empacadura Permanente` | `well.packers` | |
| Unrecognized `EquipoDeFondo` types | `well.metadata.equipoDeFondoExtra` | e.g. "Cuello Flotador" |
| Unmapped fields | `well.metadata` | Comments, dates, FieldId, etc. |

### Overrides

If the backend sends incomplete data, pass overrides:

```tsx
const well = parseBackendWell(json, {
  totalDepth: 16500,      // Override calculated totalDepth
  liftMethod: 'GL',       // Override the lift method
});
```

### Fractional Diameter Utility

Exported separately for use in other contexts:

```tsx
import { parseFractionalDiameter } from '@mik3dev/react-well-completion';

parseFractionalDiameter('13 3/8"');  // 13.375
parseFractionalDiameter('9 5/8"');   // 9.625
parseFractionalDiameter('3/8');      // 0.375
parseFractionalDiameter('3.5');      // 3.5
parseFractionalDiameter('abc');      // 0 (fallback)
```

## Customization

### Label Visibility

Hide specific label categories. All labels are visible by default.

```tsx
<WellDiagram
  well={well}
  labels={{
    casings: true,
    tubing: true,
    rods: false,
    mandrels: true,
    wellDetail: true,
    casingDetail: true,
    tubingDetail: false,
  }}
/>
```

Available categories: `casings`, `tubing`, `rods`, `pump`, `perforations`, `sands`, `packers`, `nipples`, `mandrels`, `depths`, `yacimientos`, `wellDetail`, `casingDetail`, `tubingDetail`.

### Theme

Customize the brand colors of the detail tables:

```tsx
<WellDiagram
  well={well}
  theme={{
    headerBg: '#1a1a2e',     // Table header background
    accent: '#e94560',        // Accent stripe under header
    headerText: '#ffffff',    // Header text color
  }}
/>
```

Defaults: `headerBg: '#205394'`, `accent: '#377AF3'`, `headerText: '#FFFFFF'`.

### Orientation

Both diagrams support horizontal orientation:

```tsx
const well = {
  ...createWell('Pozo-H', 'BM'),
  orientation: 'horizontal',  // 'vertical' (default) | 'horizontal'
  // ...
};
```

### Half Section

Show only half of the diagram (cross-section view):

```tsx
const well = {
  ...createWell('Pozo-HS', 'GL'),
  halfSection: true,
  halfSide: 'right',  // 'right' (default) | 'left'
  // ...
};
```

## API Reference

### Exports

```tsx
// Components
import { WellDiagram, SimplifiedDiagram } from '@mik3dev/react-well-completion';

// Parser
import { parseBackendWell, parseFractionalDiameter } from '@mik3dev/react-well-completion';

// Factories
import {
  createWell, createCasing, createTubingSegment, createRodSegment,
  createPump, createPacker, createSeatNipple, createPlug,
  createGasAnchor, createMandrel, createSleeve, createPacking,
  createPerforation, createSand, createWire,
} from '@mik3dev/react-well-completion';

// Theme
import { defaultTheme } from '@mik3dev/react-well-completion';

// Constants
import { ALL_LABEL_CATEGORIES, LABEL_CATEGORIES } from '@mik3dev/react-well-completion';

// Hook (advanced)
import { useDiagramConfig } from '@mik3dev/react-well-completion';

// Types
import type {
  Well, LiftMethod, DiagramOrientation, HalfSide,
  Casing, TubingSegment, RodSegment, Pump, Packer,
  SeatNipple, Plug, GasAnchor, Mandrel, Sleeve,
  Packing, Perforation, Sand, Wire,
  LabelCategory, BrandTheme, DiagramConfig,
  WellDiagramProps, SimplifiedDiagramProps,
  ParseBackendWellOverrides,
} from '@mik3dev/react-well-completion';
```

### Well Type

```typescript
interface Well {
  id: string;
  name: string;
  totalDepth: number;          // feet
  totalFreeDepth: number;      // feet
  liftMethod: 'BM' | 'BCP' | 'BES' | 'GL';
  latitude?: number;
  longitude?: number;
  estacionFlujo?: string;
  mesaRotaria?: number;
  orientation?: 'vertical' | 'horizontal';
  halfSection?: boolean;
  halfSide?: 'right' | 'left';
  casings: Casing[];
  tubingString: TubingSegment[];
  rodString: RodSegment[];     // BM/BCP only
  pump: Pump | null;
  packers: Packer[];
  seatNipples: SeatNipple[];
  plugs: Plug[];
  gasAnchors: GasAnchor[];
  mandrels: Mandrel[];         // GL only
  sleeves: Sleeve[];
  packings: Packing[];
  perforations: Perforation[];
  sands: Sand[];
  wire: Wire | null;           // BES only
  metadata?: Record<string, unknown>;
}
```

### Lift Methods

| Code | Method | Components |
|---|---|---|
| `BM` | Beam Pump | `rodString`, `pump`, `gasAnchors` |
| `BCP` | Progressing Cavity Pump | `rodString`, `pump` |
| `BES` | Electric Submersible Pump | `wire`, `pump` |
| `GL` | Gas Lift | `mandrels` |

## License

MIT
