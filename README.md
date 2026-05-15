# Well Completion Diagram

Herramienta de visualizacion de diagramas de completacion de pozos petroleros. Renderiza diagramas SVG interactivos de equipos de subsuelo y soporta 4 metodos de levantamiento: **BM** (Bombeo Mecanico), **BCP** (Bomba de Cavidad Progresiva), **BES** (Bomba Electrosumergible), **GL** (Gas Lift).

## Estructura del Proyecto

Este es un **monorepo pnpm** con dos paquetes:

```
packages/
├── react-well-completion/   # Libreria React (publicable en npm)
└── demo-app/                # Aplicacion de demostracion
```

| Paquete | Descripcion | Dependencias clave |
|---------|-------------|-------------------|
| `react-well-completion` | Componentes SVG puros. Recibe datos via props, sin stores ni estado global | `react` (peer), `uuid` |
| `demo-app` | App SPA con editor, toolbar, exportacion PNG/SVG | `zustand`, `html-to-image`, `react-well-completion` |

## Requisitos

- **Node.js** >= 18
- **pnpm** >= 9

## Instalacion y Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo (demo-app con HMR)
pnpm dev

# Build completo (libreria + demo-app)
pnpm build

# Build solo libreria
pnpm build:lib

# Lint
pnpm lint

# Preview del build de produccion
pnpm --filter demo-app preview
```

---

## Uso de la Libreria

### Instalacion

```bash
npm install react-well-completion
```

### Ejemplo Basico — Pozo con Bombeo Mecanico

```tsx
import { WellDiagram, createWell, createCasing, createTubingSegment, createPump, createPerforation } from 'react-well-completion';
import type { Well } from 'react-well-completion';

// Construir el pozo usando factory functions
const well: Well = {
  ...createWell('Pozo-001', 'BM'),
  totalDepth: 5000,
  totalFreeDepth: 4800,
  casings: [
    createCasing({ diameter: 9.625, top: 0, base: 3000, isLiner: false, weight: 47, grade: 'N-80' }),
    createCasing({ diameter: 7, top: 0, base: 5000, isLiner: false, weight: 26, grade: 'J-55' }),
    createCasing({ diameter: 5.5, top: 4500, base: 5000, isLiner: true }),
  ],
  tubingString: [
    createTubingSegment({ segment: 1, diameter: 3.5, length: 3000 }),
    createTubingSegment({ segment: 2, diameter: 2.875, length: 1500 }),
  ],
  rodString: [
    { id: 'r1', segment: 1, diameter: 1, length: 2500 },
    { id: 'r2', segment: 2, diameter: 0.875, length: 2000 },
  ],
  pump: createPump({ type: 'BM', depth: 4500, diameter: 2.5, length: 50 }),
  perforations: [
    createPerforation({ top: 4600, base: 4700, type: 'shoot', yacimiento: 'Fm. Oficina', arena: 'O-12' }),
    createPerforation({ top: 4750, base: 4850, type: 'shoot', yacimiento: 'Fm. Oficina', arena: 'O-14' }),
  ],
  packers: [],
  seatNipples: [],
  plugs: [],
  gasAnchors: [],
  mandrels: [],
  sleeves: [],
  packings: [],
  sands: [],
  wire: null,
};

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <WellDiagram well={well} />
    </div>
  );
}
```

### Ejemplo — Pozo Gas Lift con Mandriles

```tsx
import { WellDiagram, createWell, createCasing, createTubingSegment, createMandrel, createPerforation } from 'react-well-completion';

const glWell = {
  ...createWell('GL-003', 'GL'),
  totalDepth: 8000,
  totalFreeDepth: 7500,
  casings: [
    createCasing({ diameter: 13.375, top: 0, base: 2000, isLiner: false, weight: 68, grade: 'K-55' }),
    createCasing({ diameter: 9.625, top: 0, base: 6000, isLiner: false, weight: 47, grade: 'N-80' }),
    createCasing({ diameter: 7, top: 5500, base: 8000, isLiner: true }),
  ],
  tubingString: [
    createTubingSegment({ segment: 1, diameter: 3.5, length: 7000 }),
  ],
  rodString: [],
  pump: null,
  mandrels: [
    createMandrel({ segment: 1, depth: 2000, diameter: 1, valveType: 'operating' }),
    createMandrel({ segment: 2, depth: 3500, diameter: 1, valveType: 'operating' }),
    createMandrel({ segment: 3, depth: 5000, diameter: 1, valveType: 'dummy' }),
    createMandrel({ segment: 4, depth: 6500, diameter: 1, valveType: null }),
  ],
  perforations: [
    createPerforation({ top: 7200, base: 7400, type: 'shoot', yacimiento: 'Fm. Merecure' }),
    createPerforation({ top: 7500, base: 7700, type: 'shoot', yacimiento: 'Fm. Merecure' }),
  ],
  packers: [],
  seatNipples: [],
  plugs: [],
  gasAnchors: [],
  sleeves: [],
  packings: [],
  sands: [],
  wire: null,
};

function App() {
  return <WellDiagram well={glWell} />;
}
```

### Diagrama Simplificado

El `SimplifiedDiagram` muestra una version esquematica en escala de grises, ideal para reportes e impresion:

```tsx
import { SimplifiedDiagram } from 'react-well-completion';

function Report({ well }) {
  return (
    <div style={{ width: 400, height: 600 }}>
      <SimplifiedDiagram well={well} />
    </div>
  );
}
```

Tambien acepta `profiles` (mismo prop que `WellDiagram`) — el panel de perfiles funciona identico en ambos componentes:

```tsx
<SimplifiedDiagram well={well} profiles={profiles} />
```

Nota: `SimplifiedDiagram` no soporta visualmente `halfSection` (sus layers siempre dibujan el casing simetrico completo), por lo que el modo de panel-fill cuando hay half-section no aplica aqui.

### Controlando Visibilidad de Labels

Por defecto todas las etiquetas estan visibles. Puedes ocultar las que no necesites:

```tsx
<WellDiagram
  well={well}
  labels={{
    casings: true,           // Etiquetas de casing (diametro, tipo)
    tubing: true,            // Etiquetas de tuberia
    rods: false,             // Ocultar cabillas
    pump: true,              // Etiqueta de bomba
    perforations: true,      // Intervalos perforados
    sands: false,            // Ocultar arenas
    packers: true,           // Packers
    nipples: false,          // Ocultar niples
    mandrels: true,          // Mandriles GL
    depths: true,            // Marcadores de profundidad
    yacimientos: true,       // Brackets de yacimiento/arena
    wellDetail: true,        // Tabla "Detalle de Pozo"
    casingDetail: true,      // Tabla "Detalle de Casing"
    tubingDetail: false,     // Ocultar tabla de tuberias
  }}
/>
```

### Personalizacion de Colores (Theme)

Los colores de las tablas de detalle son configurables:

```tsx
// Theme por defecto
<WellDiagram well={well} />

// Theme personalizado
<WellDiagram
  well={well}
  theme={{
    headerBg: '#1a1a2e',     // Fondo del header de las tablas
    accent: '#e94560',        // Linea de acento bajo el header
    headerText: '#ffffff',    // Color del texto del header
    earthFill: 'transparent', // Fill de la EarthLayer (default: 'url(#earthFill)')
  }}
/>

// Solo cambiar un color (los demas usan defaults)
<WellDiagram
  well={well}
  theme={{ accent: '#27ae60' }}
/>
```

### Orientacion Horizontal

Ambos diagramas soportan orientacion horizontal configurando el campo `orientation` del pozo:

```tsx
const well = {
  ...createWell('Pozo-H', 'BM'),
  orientation: 'horizontal',  // 'vertical' (default) | 'horizontal'
  // ... resto de datos
};

<WellDiagram well={well} />
```

### Media Seccion (Half Section)

Para mostrar solo la mitad del diagrama (corte en seccion):

```tsx
const well = {
  ...createWell('Pozo-HS', 'GL'),
  halfSection: true,
  halfSide: 'right',  // 'right' (default) | 'left'
  // ... resto de datos
};
```

### EarthLayer (formacion)

La libreria pinta la formacion entre **`max(non-liner casing shoes)`** y `totalDepth`. Es decir: debajo del shoe del casing no-liner mas profundo, la unica proteccion contra la formacion es el liner — esa es la zona productiva. `totalFreeDepth` (HUD) **no** se usa para este criterio visual; HUD es una restriccion operacional, no fisica.

Si el pozo no tiene casings non-liner (solo liners o sin casings), el EarthLayer no renderiza nada.

El fill es configurable:

```tsx
// Default en WellDiagram (textura marron)
<WellDiagram well={well} />

// Fill custom (color solido, transparente, o patron SVG)
<WellDiagram well={well} theme={{ earthFill: '#fafafa' }} />
<WellDiagram well={well} theme={{ earthFill: 'transparent' }} />

// SimplifiedDiagram default es 'transparent' — opt-in para mostrarlo
<SimplifiedDiagram well={well} earthFill="#f5f5f5" />
```

### Panel de Perfiles (Pressure / Temperature / etc.)

`WellDiagram` acepta un prop opcional `profiles` para renderizar uno o mas tracks de perfiles (presion, temperatura, registros, etc.) junto al diagrama, compartiendo el eje de profundidad.

```tsx
import { WellDiagram } from 'react-well-completion';
import type { Profile } from 'react-well-completion';

const profiles: Profile[] = [
  {
    id: 'pres',
    name: 'Presion',
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
    color: '#ef4444',                 // opcional, paleta automatica si falta
    scale: { min: 50, max: 200 },     // opcional, auto-min/max +/- 5% si falta
    data: [
      { depth: 0,    value: 80 },
      { depth: 4500, value: 145 },
    ],
  },
];

<WellDiagram well={well} profiles={profiles} profileTrackWidth={140} />
```

Comportamiento:

- **Layout**: tracks paralelos, uno por perfil. Cada track con header (`name unit`), eje de valor (3 ticks: min, mid, max), grid lines, y la curva.
- **Eje de profundidad sincronizado**: cada track usa el mismo `depthToPos` que el diagrama, alineacion pixel-perfect con la correccion gamma γ=1.5.
- **Orientacion**: el panel "sigue" al diagrama. Vertical → tracks a la derecha. Horizontal → tracks apilados debajo.
- **Tooltip al hover**: dos lineas — `{name}: {value} {unit}` y `@ {depth} ft`.
- **Half-section fill**: cuando se activan al mismo tiempo `halfSection: true` y `profiles`, el panel se expande para ocupar la mitad liberada por la half-section en cualquiera de las dos orientaciones. Los tracks crecen para llenar el hueco (`profileTrackWidth` actua como minimo).
  - **Vertical** + `halfSide: 'right'` (diagrama a la derecha) → panel a la **izquierda**.
  - **Vertical** + `halfSide: 'left'` (diagrama a la izquierda) → panel a la **derecha** (posicion habitual, mas ancho).
  - **Horizontal** + `halfSide: 'right'` (diagrama arriba) → panel en la **mitad inferior**.
  - **Horizontal** + `halfSide: 'left'` (diagrama abajo) → panel en la **mitad superior**.
- **Backward-compatible**: sin el prop `profiles`, el render es identico al de antes de este feature.

Edge cases manejados:

| Caso | Comportamiento |
|---|---|
| `data: []` | Track con header y eje, sin curva |
| 1 punto | `<circle>` visible (no polyline) |
| Todos los valores iguales | Linea recta al centro del eje de valor |
| `depth` fuera de `[0, totalDepth]` | Filtrado silenciosamente |
| `data` desordenado | Se ordena internamente (sin mutar input) |
| `scale.min > scale.max` | Reordenado automaticamente |

Para mejor performance, se recomienda < 500 puntos por perfil (la lib no hace downsampling en v1).

---

## API Reference

### Componentes

| Componente | Props | Descripcion |
|---|---|---|
| `WellDiagram` | `well: Well`, `labels?: Partial<Record<LabelCategory, boolean>>`, `theme?: Partial<BrandTheme>`, `profiles?: Profile[]`, `profileLayout?: ProfileLayout`, `profileTrackWidth?: number` | Diagrama completo con labels, tablas de detalle, tooltips, y panel opcional de perfiles |
| `SimplifiedDiagram` | `well: Well`, `profiles?: Profile[]`, `profileLayout?: ProfileLayout`, `profileTrackWidth?: number`, `earthFill?: string` | Diagrama esquematico en escala de grises, con panel opcional de perfiles y EarthLayer opcional (`earthFill` default `'transparent'`) |

### Tipos Principales

```typescript
type LiftMethod = 'BM' | 'BCP' | 'BES' | 'GL';

type DiagramOrientation = 'vertical' | 'horizontal';

interface Well {
  id: string;
  name: string;
  totalDepth: number;          // pies
  totalFreeDepth: number;      // pies
  liftMethod: LiftMethod;
  latitude?: number;
  longitude?: number;
  estacionFlujo?: string;
  mesaRotaria?: number;        // pies
  orientation?: DiagramOrientation;
  halfSection?: boolean;
  halfSide?: 'right' | 'left';
  casings: Casing[];
  tubingString: TubingSegment[];
  rodString: RodSegment[];     // solo BM/BCP
  pump: Pump | null;
  packers: Packer[];
  seatNipples: SeatNipple[];
  plugs: Plug[];
  gasAnchors: GasAnchor[];
  mandrels: Mandrel[];         // solo GL
  sleeves: Sleeve[];
  packings: Packing[];
  perforations: Perforation[];
  sands: Sand[];
  wire: Wire | null;           // solo BES
}

interface BrandTheme {
  headerBg: string;            // default '#205394'
  accent: string;              // default '#377AF3'
  headerText: string;          // default '#FFFFFF'
  earthFill: string;           // default 'url(#earthFill)' (textura de formacion)
}

interface ProfilePoint {
  depth: number;               // pies
  value: number;               // unidad arbitraria, definida por Profile.unit
}

interface Profile {
  id: string;
  name: string;                // header del track, e.g. "Presion"
  unit: string;                // sufijo del header, e.g. "psi"
  color?: string;              // opcional, paleta automatica si falta
  scale?: { min?: number; max?: number };  // opcional, fuerza rango del eje
  data: ProfilePoint[];        // pares depth/value, no requiere estar ordenado
}

type ProfileLayout = 'tracks';  // futuro: 'tracks' | 'overlay'
```

### Factory Functions

Todas las factories generan un `id` UUID automaticamente:

| Factory | Campos requeridos |
|---------|------------------|
| `createWell(name, liftMethod)` | Nombre del pozo, metodo de levantamiento |
| `createCasing({ diameter, top, base, isLiner })` | Diametro OD (pulg), tope/base (pies), si es liner |
| `createTubingSegment({ segment, diameter, length })` | Numero de segmento, diametro OD, longitud (pies) |
| `createRodSegment({ segment, diameter, length })` | Numero de segmento, diametro, longitud |
| `createPump({ type, depth, diameter, length })` | Tipo (BM/BCP/BES/GL), profundidad, diametro, longitud |
| `createPacker({ depth, diameter })` | Profundidad, diametro |
| `createMandrel({ segment, depth, diameter, valveType })` | Segmento, profundidad, diametro, tipo de valvula (`'operating' \| 'dummy' \| null`) |
| `createPerforation({ top, base, type })` | Tope/base (pies), tipo ('shoot' o 'slot') |
| `createSand({ name, segment, top, base })` | Nombre, segmento, tope/base |
| `createWire({ depth })` | Profundidad del cable BES |
| `createSeatNipple({ depth, diameter, od, type })` | Profundidad, diametro, OD, tipo |
| `createPlug({ depth })` | Profundidad |
| `createGasAnchor({ depth, diameter, length })` | Profundidad, diametro, longitud |
| `createSleeve({ depth, diameter })` | Profundidad, diametro |
| `createPacking({ depth, diameter, od })` | Profundidad, diametro, OD |

### Parser de Datos del Backend

Si recibes datos desde un backend en formato crudo (con nombres en español, fracciones como strings, etc.), usa `parseBackendWell` para convertirlos a un `Well` listo para renderizar:

```tsx
import { WellDiagram, parseBackendWell } from 'react-well-completion';

async function loadWell() {
  const response = await fetch('/api/wells/VLG3922');
  const json = await response.json();

  // Convierte el JSON crudo del backend a un objeto Well tipado
  const well = parseBackendWell(json);

  return <WellDiagram well={well} />;
}
```

#### Con Overrides

Si el backend envia datos incompletos (ej. `Profundidad Total: 0` o un `Tipo de Trabajo` desconocido), puedes pasar overrides:

```tsx
const well = parseBackendWell(json, {
  totalDepth: 16500,      // Override del totalDepth calculado
  liftMethod: 'GL',       // Override del lift method
});
```

#### Que hace el parser

- **Mapea nombres de campos**: `Pozo → name`, `HUD → totalFreeDepth`, `Tipo de Trabajo → liftMethod`
- **Parsea diametros fraccionales**: `"13 3/8\""` → `13.375`, `"9 5/8\""` → `9.625`
- **Mapea lift methods**: `CVGL → GL`, `BME → BM`, etc.
- **Calcula `totalDepth`**: Si el backend envia 0, usa el max de bases de casings/perforations/tubing
- **Distribuye `EquipoDeFondo` por tipo**: `Niple → seatNipples`, `Manga → sleeves`, `Empacadura → packers`
- **Infiere `isLiner` de casings**: items del array `Liner[]` siempre quedan como `isLiner: true`. Para items del array `Casing[]`, si `Tope (pies) > 0` (no llega a superficie) se infiere `isLiner: true`. Esto cubre backends que mezclan todo en un solo array.
- **Infiere `valveType` de mandriles**: `PTR PSI` presente → `'operating'`, `Tipo Válvula: 'Dummy'` → `'dummy'`, ninguno → `null`
- **Preserva campos extras en metadata**: Comentarios, fechas, FieldId, y tipos no reconocidos de equipo de fondo van a `well.metadata`

#### Utilidad: parseFractionalDiameter

```tsx
import { parseFractionalDiameter } from 'react-well-completion';

parseFractionalDiameter('13 3/8"');  // 13.375
parseFractionalDiameter('9 5/8"');   // 9.625
parseFractionalDiameter('3/8');      // 0.375
parseFractionalDiameter('3.5');      // 3.5
```

### Hook Avanzado

```typescript
import { useDiagramConfig } from 'react-well-completion';

// Para usuarios avanzados que necesitan calcular coordenadas del diagrama
const config = useDiagramConfig(width, height, well);
// config.depthToPos(depth)        — convierte profundidad a posicion Y
// config.diameterToSpan(diameter)  — convierte diametro a span horizontal
// config.centerLine               — centro del eje del diagrama
```

---

## Metodos de Levantamiento

| Codigo | Metodo | Componentes especificos | Campos relevantes en Well |
|--------|--------|------------------------|--------------------------|
| `BM` | Bombeo Mecanico | Cabillas, bomba mecanica, ancla de gas | `rodString`, `pump`, `gasAnchors` |
| `BCP` | Cavidad Progresiva | Cabillas, bomba BCP | `rodString`, `pump` |
| `BES` | Electrosumergible | Cable BES, bomba BES | `wire`, `pump` |
| `GL` | Gas Lift | Mandriles con/sin valvula | `mandrels` |

### Componentes Comunes a Todos los Metodos

- **Casings**: Revestimientos del pozo (conductor, superficie, produccion, liner)
- **Tubing**: Sarta de tuberia de produccion
- **Perforations**: Intervalos canhoneados o ranurados
- **Packers**: Empacaduras de aislamiento
- **Seat Nipples**: Niples de asiento (regular y pulido)
- **Plugs**: Tapones
- **Sands**: Formaciones arenosas
- **Packings**: Empacaduras de la sarta

---

## Licencia

MIT
