# Design: Migrar a Libreria npm `react-well-completion`

## Objetivo

Extraer los componentes de diagrama de pozo (`WellDiagram`, `SimplifiedDiagram`) en una libreria React publicable, separada de la aplicacion de demostracion.

**Prioridad:** Reutilizacion interna primero, open source para la industria despues.

**Estrategia de publicacion:** Repositorio privado, paquete en GitHub Packages (npm registry privado). Transicion a npm publico cuando haya un release estable.

---

## Decisiones de Diseno

| Decision | Eleccion | Razon |
|---|---|---|
| Estructura | Monorepo con pnpm workspaces | Iteracion rapida, un solo `git clone`, dependencias separadas |
| Nombre del paquete | `react-well-completion` | Generico, preparado para open source |
| Manejo de visibilidad | Props puras con defaults | Simple, portable, sin imponer stores al consumidor |
| Theming | Minimo (3 brand colors) | Suficiente para personalizar headers/accent sin complejidad |
| Estrategia de migracion | Gradual por fases (7 fases) | Bajo riesgo, cada fase verificable independientemente |
| Target consumers | Solo React por ahora | Web components/wrappers se agregan si aparece demanda |
| Registry | GitHub Packages (privado) | Control de acceso, transicion trivial a npm publico |

---

## Arquitectura

### Estructura del Monorepo

```
well-completion-diagram/
├── packages/
│   ├── react-well-completion/        # LA LIBRERIA
│   │   ├── src/
│   │   │   ├── index.ts              # API publica
│   │   │   ├── types/
│   │   │   │   ├── well.ts
│   │   │   │   ├── diagram.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-diagram-config.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   └── well-factory.ts
│   │   │   ├── components/
│   │   │   │   ├── WellDiagram.tsx
│   │   │   │   ├── SimplifiedDiagram.tsx
│   │   │   │   ├── SvgDefs.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   ├── layers/           # 12 layers del diagrama principal
│   │   │   │   ├── simplified/       # 8 layers del simplificado
│   │   │   │   ├── icons/            # 13 iconos SVG
│   │   │   │   └── elements/
│   │   │   └── theme.ts              # brand colors por defecto
│   │   ├── package.json
│   │   ├── vite.config.ts            # library mode (ESM + CJS + .d.ts)
│   │   └── tsconfig.json
│   │
│   └── demo-app/                     # LA APP ACTUAL
│       ├── src/
│       │   ├── App.tsx
│       │   ├── App.css
│       │   ├── store/                # zustand stores (solo app)
│       │   ├── hooks/
│       │   │   └── use-export.ts     # solo app (html-to-image)
│       │   ├── components/
│       │   │   ├── Toolbar.tsx
│       │   │   └── editor/
│       │   └── data/
│       │       └── example-wells.ts
│       ├── package.json
│       └── vite.config.ts            # app mode (SPA)
│
├── package.json                       # workspace root
├── pnpm-workspace.yaml
└── openspec/
```

### Distribucion de dependencias

| Dependencia | Libreria | Demo-app |
|---|---|---|
| `react` | peerDependency (>=18.0.0) | dependency |
| `react-dom` | peerDependency (>=18.0.0) | dependency |
| `uuid` | dependency | — |
| `zustand` | — | dependency |
| `html-to-image` | — | dependency |
| `vite-plugin-dts` | devDependency | — |

---

## API Publica

### Exports

```typescript
// packages/react-well-completion/src/index.ts

// Componentes principales
export { WellDiagram } from './components/WellDiagram';
export { SimplifiedDiagram } from './components/SimplifiedDiagram';

// Tipos
export type {
  Well, LiftMethod, DiagramOrientation, HalfSide,
  Casing, TubingSegment, RodSegment, Pump, Packer,
  SeatNipple, Plug, GasAnchor, Mandrel, Sleeve,
  Packing, Perforation, Sand, Wire,
} from './types';
export type { DiagramConfig } from './types';
export type { WellDiagramProps, SimplifiedDiagramProps } from './types';
export type { BrandTheme } from './theme';

// Factories
export {
  createWell, createCasing, createTubingSegment,
  createRodSegment, createPump, createPacker,
  createSeatNipple, createPlug, createGasAnchor,
  createMandrel, createSleeve, createPacking,
  createPerforation, createSand, createWire,
} from './utils/well-factory';

// Hook avanzado
export { useDiagramConfig } from './hooks/use-diagram-config';
export { diameterToX, computeCasingPositions, computeCasingSpans } from './hooks/use-diagram-config';
```

### Props de componentes

```typescript
type LabelCategory =
  | 'casings' | 'tubing' | 'rods' | 'pump' | 'perforations'
  | 'sands' | 'packers' | 'nipples' | 'mandrels' | 'depths'
  | 'yacimientos' | 'wellDetail' | 'casingDetail' | 'tubingDetail';

interface WellDiagramProps {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;  // default: todas true
  theme?: Partial<BrandTheme>;
}

interface SimplifiedDiagramProps {
  well: Well;
  theme?: Partial<BrandTheme>;
}
```

### Brand Theme

```typescript
interface BrandTheme {
  headerBg: string;      // default '#205394'
  accent: string;        // default '#377AF3'
  headerText: string;    // default '#FFFFFF'
}
```

### Uso minimo por el consumidor

```tsx
import { WellDiagram, createWell } from 'react-well-completion';

const well = createWell('Pozo-001', 'BM');

function App() {
  return <WellDiagram well={well} />;
}
```

### Uso con labels y theme

```tsx
import { WellDiagram } from 'react-well-completion';

function App({ well }) {
  return (
    <WellDiagram
      well={well}
      labels={{ casings: true, tubing: true, wellDetail: false }}
      theme={{ headerBg: '#1a1a2e', accent: '#e94560' }}
    />
  );
}
```

---

## Desacoplamiento de Stores

El unico acoplamiento con Zustand esta en 2 archivos:

1. **`LabelsLayer.tsx`** — lee `useLabelsStore().visible` para decidir que labels mostrar
2. **`WellDetailLayer.tsx`** — lee `useLabelsStore().visible.wellDetail`, `.casingDetail`, `.tubingDetail`

### Refactorizacion

**Antes (acoplado):**
```tsx
// LabelsLayer.tsx
const { visible } = useLabelsStore();
if (!visible.casings) return null;
```

**Despues (props puras):**
```tsx
// LabelsLayer.tsx
interface LabelsLayerProps {
  well: Well;
  config: DiagramConfig;
  visible: Record<LabelCategory, boolean>;
}
const LabelsLayer = ({ well, config, visible }: LabelsLayerProps) => {
  if (!visible.casings) return null;
  // ...
};
```

**En WellDiagram (la libreria):**
```tsx
const WellDiagram = ({ well, labels }: WellDiagramProps) => {
  const defaultLabels = Object.fromEntries(
    ALL_LABEL_CATEGORIES.map(k => [k, true])
  ) as Record<LabelCategory, boolean>;
  const merged = { ...defaultLabels, ...labels };

  return (
    <svg>
      {/* ... otros layers ... */}
      <LabelsLayer well={well} config={config} visible={merged} />
      <WellDetailLayer well={well} config={config} visible={merged} />
    </svg>
  );
};
```

**En demo-app (conecta store a props):**
```tsx
const { visible } = useLabelsStore();
<WellDiagram well={well} labels={visible} />
```

---

## Configuracion Tecnica

### pnpm workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### package.json de la libreria

```json
{
  "name": "react-well-completion",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "uuid": "^13.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "files": ["dist"],
  "license": "MIT"
}
```

### Vite library mode

```typescript
// packages/react-well-completion/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' }), dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
```

---

## Fases de Migracion

### Fase 1: Preparar monorepo
- Inicializar pnpm workspace en la raiz
- Crear `packages/react-well-completion/` con `package.json`, `tsconfig.json`
- Crear `packages/demo-app/` y mover toda la app actual ahi
- Verificar que `pnpm dev` sigue funcionando desde demo-app

### Fase 2: Extraer tipos, hooks y utils
- Copiar `types/`, `hooks/use-diagram-config.ts`, `utils/well-factory.ts` a la libreria
- Crear `index.ts` con exports de tipos, hooks y factories
- Actualizar imports en demo-app para consumir desde `react-well-completion`
- Verificar app funciona

### Fase 3: Desacoplar stores a props
- Refactorizar `LabelsLayer` — recibir `visible` como prop
- Refactorizar `WellDetailLayer` — recibir visibilidad como prop
- Refactorizar `WellDiagram` — aceptar `labels` prop, pasar a layers internos
- Actualizar demo-app: conectar `useLabelsStore` a `labels` prop
- Verificar que todo funciona igual

### Fase 4: Mover componentes a la libreria
- Mover `WellDiagram.tsx`, layers, icons, elements, `SvgDefs.tsx`, `Tooltip.tsx`
- Mover `SimplifiedDiagram` y sus layers
- Actualizar demo-app para importar desde `react-well-completion`
- Verificar app funciona

### Fase 5: Brand theme configurable
- Definir `BrandTheme` interface y `defaultTheme`
- Reemplazar colores hardcodeados en `WellDetailLayer` por valores del theme
- Agregar `theme` prop a `WellDiagram`
- Sin theme prop, se ve exactamente igual

### Fase 6: Build de libreria + publicacion
- Configurar `vite.config.ts` con `build.lib`
- `rollupOptions.external`: react, react-dom, react/jsx-runtime
- Generacion de `.d.ts` via `vite-plugin-dts`
- Configurar `package.json` con exports, peerDependencies, publishConfig
- Build y verificar que demo-app consume el build correctamente

### Fase 7: README y primer release
- README con instalacion, uso basico, API de props
- `.npmrc` con configuracion de GitHub Packages
- Publicar `v0.1.0` en GitHub Packages (privado)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|---|---|---|---|
| Imports rotos al mover archivos | Alta | Bajo | Cada fase verifica `build` + `dev` |
| Tipos no se generan correctamente | Media | Medio | `vite-plugin-dts` con `rollupTypes: true`, verificar en fase 6 |
| Hot reload roto entre packages | Media | Bajo | pnpm workspace linking, `"workspace:*"` en demo-app |
| `uuid` como dependencia de la lib | Baja | Bajo | Alternativa futura: `crypto.randomUUID()` nativo |
| GitHub Packages auth en CI | Baja | Medio | Documentar `.npmrc` + `GITHUB_TOKEN` en README |

## Fuera de alcance (YAGNI)

- SSR / server-side rendering
- Web components wrapper
- Storybook
- Tests unitarios de la libreria
- Changelog automatico / CI de publicacion
