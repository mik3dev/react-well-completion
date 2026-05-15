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
| `WellDiagram` | Full detailed diagram with labels, detail tables, tooltips, and an optional profile panel (pressure, temperature, etc.) |
| `SimplifiedDiagram` | Grayscale schematic diagram, ideal for reports and printing — also supports the optional profile panel |

### WellDiagram Props

```tsx
interface WellDiagramProps {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;
  theme?: Partial<BrandTheme>;
  profiles?: Profile[];               // optional profile tracks (default: undefined → no panel)
  profileLayout?: ProfileLayout;      // 'tracks' (only mode in v1)
  profileTrackWidth?: number;         // px per track in vertical, px per track height in horizontal (default: 140)
}
```

### SimplifiedDiagram Props

```tsx
interface SimplifiedDiagramProps {
  well: Well;
  profiles?: Profile[];               // optional profile tracks (default: undefined → no panel)
  profileLayout?: ProfileLayout;      // 'tracks' (only mode in v1)
  profileTrackWidth?: number;         // px per track in vertical, px per track height in horizontal (default: 140)
  earthFill?: string;                 // formation fill (default: 'transparent' to preserve the schematic look)
}
```

The profile panel works the same way in `SimplifiedDiagram` as in `WellDiagram` (see the **Profile Panel** section below). The schematic + profile combination is a common format for well reports and PDF exports.

Note: `SimplifiedDiagram`'s layers do not visually support `halfSection` (they always draw the full symmetric casing), so the half-section panel-fill mode does not apply here.

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
| `Casing[]` + `Liner[]` | `well.casings` | All items go to a single array. `Liner[]` entries are always `isLiner: true`. For `Casing[]` entries, `isLiner` is inferred from `Tope (pies)` — items with `Tope > 0` (i.e. don't reach the surface) are inferred as liners. This handles backends that lump everything into `Casing[]`. |
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

Customize the brand colors of the detail tables and the formation fill:

```tsx
<WellDiagram
  well={well}
  theme={{
    headerBg: '#1a1a2e',     // Table header background
    accent: '#e94560',        // Accent stripe under header
    headerText: '#ffffff',    // Header text color
    earthFill: 'transparent', // EarthLayer fill (any CSS color, pattern url, or 'transparent')
  }}
/>
```

Defaults: `headerBg: '#205394'`, `accent: '#377AF3'`, `headerText: '#FFFFFF'`, `earthFill: 'url(#earthFill)'`.

### EarthLayer (formation)

The library renders the formation between **`max(non-liner casing shoes)`** and `totalDepth`. The rationale: below the deepest non-liner shoe, the only protection between wellbore and formation is the liner — that's the productive zone. `totalFreeDepth` (HUD) is an operational restriction and is intentionally NOT used for this visual.

If a well has no non-liner casings (only liners or no casings at all), the EarthLayer renders nothing.

Override the fill via `theme.earthFill` (for `WellDiagram`) or the `earthFill` prop (for `SimplifiedDiagram` — default `'transparent'` to preserve the schematic look).

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

### Profile Panel

Render parallel profile tracks (pressure, temperature, acoustic logs, etc.) alongside the diagram, sharing the depth axis. The panel is opt-in via the `profiles` prop. When omitted, the diagram renders exactly as before.

Supported on both `WellDiagram` and `SimplifiedDiagram` — the API is identical.

```tsx
import { WellDiagram } from '@mik3dev/react-well-completion';
import type { Profile } from '@mik3dev/react-well-completion';

const profiles: Profile[] = [
  {
    id: 'pres',
    name: 'Presión',
    unit: 'psi',
    data: [
      { depth: 0,    value: 100 },
      { depth: 1500, value: 800 },
      { depth: 3000, value: 1450 },
      { depth: 4500, value: 2050 },
    ],
  },
  {
    id: 'temp',
    name: 'Temperatura',
    unit: '°F',
    color: '#ef4444',                  // optional — palette fallback if omitted
    scale: { min: 50, max: 200 },      // optional — auto from data ± 5% padding if omitted
    data: [
      { depth: 0,    value: 80 },
      { depth: 4500, value: 145 },
    ],
  },
];

<WellDiagram well={well} profiles={profiles} profileTrackWidth={140} />
```

#### Profile Shape

```tsx
interface Profile {
  id: string;                          // React key
  name: string;                        // header label, e.g. "Presión"
  unit: string;                        // header suffix, e.g. "psi"
  color?: string;                      // hex; defaults to a cycling palette
  scale?: { min?: number; max?: number };  // forces value-axis range; auto if omitted
  data: { depth: number; value: number }[];
}
```

#### Behavior

- **Layout**: parallel tracks, one per profile. Each track has its own value axis with `min`, `mid`, `max` ticks.
- **Depth axis**: shared with the diagram (pixel-perfect alignment, including the gamma γ=1.5 mapping).
- **Auto scale**: when `scale` is omitted, the value axis spans `[dataMin - 5% range, dataMax + 5% range]`. `scale.min` and `scale.max` override per-axis.
- **Color palette**: when `color` is omitted, the track uses `DEFAULT_PROFILE_COLORS[index % length]` cycling through sky/red/emerald/amber/violet/pink.
- **Tooltip**: hovering over a data point shows two lines: `{name}: {value} {unit}` and `@ {depth} ft`.
- **Orientation**: the panel follows the diagram. Vertical → tracks on the right. Horizontal → tracks stacked below.
- **Half-section fill**: when both `halfSection: true` and `profiles` are set, the panel automatically expands into the half freed by the half-section in either orientation. Tracks grow to fill the freed space (`profileTrackWidth` becomes a *minimum* in this mode).
  - **Vertical** + `halfSide: 'right'` (diagram on right) → panel on the **left**.
  - **Vertical** + `halfSide: 'left'` (diagram on left) → panel on the **right** (default position, just wider).
  - **Horizontal** + `halfSide: 'right'` (diagram on top) → panel in the **bottom half**.
  - **Horizontal** + `halfSide: 'left'` (diagram on bottom) → panel in the **top half**.
- **Backward compatibility**: omitting the `profiles` prop produces identical rendering to before this feature existed.

#### Edge Cases

| Case | Behavior |
|---|---|
| `data: []` | Track renders with header and axis but no curve |
| Single point | Renders as a visible `<circle>` (no polyline) |
| All values equal | Curve is a straight line at the center of the value axis |
| `depth` outside `[0, totalDepth]` | Point silently filtered |
| Unsorted `data` | Sorted internally (does not mutate input) |
| Inverted `scale` (`min > max`) | Sanitized — values reordered |

#### Performance

For best results, keep each profile under ~500 points. The library does no downsampling in v1; very large datasets render but may impact responsiveness.

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
  Profile, ProfilePoint, ProfileLayout,
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
