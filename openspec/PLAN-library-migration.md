# Plan: Migración a Librería Open Source

## Objetivo

Convertir los componentes de diagrama de pozo (`WellDiagram`, `SimplifiedDiagram`) en una librería React publicable en npm, separada de la aplicación de demostración.

---

## 1. Estado Actual

### Lo que ya está bien

- **`SimplifiedDiagram`** es completamente independiente: recibe `Well` como prop, no depende de stores, providers, ni contextos externos.
- **Tipos bien definidos** en `src/types/` — `Well`, `Casing`, `TubingSegment`, `DiagramConfig`, etc.
- **`useDiagramConfig`** es un hook puro que calcula coordenadas a partir de datos, sin side effects.
- **SVGs inline** — no hay CSS externo para los diagramas, todo es atributos SVG.
- **Factory functions** (`createWell`, `createCasing`, etc.) facilitan la construcción de datos.

### Lo que necesita cambiar

| Problema | Descripción | Impacto |
|---|---|---|
| **Acoplamiento a Zustand** | `WellDiagram` → `WellDetailLayer` y `LabelsLayer` leen de `useLabelsStore` para toggles de visibilidad | Alto — una librería no puede imponer un store |
| **Acoplamiento a `useExport`** | Hook de exportación usa `html-to-image` y accede al DOM directamente | Medio — es funcionalidad de app, no de librería |
| **Colores hardcodeados** | Paletas de colores definidas como constantes en cada layer | Bajo-Medio — dificulta personalización |
| **Build de app, no de librería** | Vite configurado como SPA (`index.html`), no genera ESM/CJS | Alto — necesario para publicar |
| **Sin API pública clara** | No hay un `index.ts` que defina qué se exporta | Medio |
| **Dependencias mezcladas** | `zustand`, `html-to-image`, `uuid` son de la app, no de la librería | Medio |

---

## 2. Arquitectura Propuesta

### Estructura de directorios

```
well-completion-diagram/
├── packages/
│   ├── react-well-diagram/          ← LA LIBRERÍA (npm package)
│   │   ├── src/
│   │   │   ├── index.ts             ← API pública
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
│   │   │   │   ├── layers/          ← todos los layers del diagrama principal
│   │   │   │   ├── simplified/      ← todos los layers del simplificado
│   │   │   │   ├── icons/
│   │   │   │   └── elements/
│   │   │   └── themes/
│   │   │       └── default.ts       ← paleta de colores por defecto
│   │   ├── package.json
│   │   ├── vite.config.ts           ← library mode
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── demo-app/                    ← LA APP ACTUAL (consume la librería)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── App.css
│       │   ├── store/               ← zustand stores (solo app)
│       │   ├── hooks/
│       │   │   └── use-export.ts    ← solo app
│       │   ├── components/
│       │   │   ├── Toolbar.tsx
│       │   │   └── editor/
│       │   └── data/
│       │       └── example-wells.ts
│       ├── package.json
│       └── vite.config.ts           ← app mode (SPA)
│
├── package.json                     ← workspace root
├── pnpm-workspace.yaml              ← o npm workspaces
└── openspec/                        ← se mantiene en la raíz
```

### API pública de la librería

```typescript
// packages/react-well-diagram/src/index.ts

// Componentes principales
export { WellDiagram } from './components/WellDiagram';
export { SimplifiedDiagram } from './components/SimplifiedDiagram';

// Tipos
export type { Well, Casing, TubingSegment, RodSegment, Pump, Packer, ... } from './types';
export type { DiagramConfig, DiagramOrientation, HalfSide } from './types';
export type { WellDiagramProps, SimplifiedDiagramProps } from './types';
export type { DiagramTheme } from './themes/default';

// Factories
export { createWell, createCasing, createPump, ... } from './utils/well-factory';

// Hook (para usuarios avanzados)
export { useDiagramConfig } from './hooks/use-diagram-config';
```

### Props de los componentes

```typescript
interface WellDiagramProps {
  well: Well;

  // Visibilidad de labels (reemplaza useLabelsStore)
  labels?: Partial<Record<LabelCategory, boolean>>;

  // Visibilidad de detail blocks
  showWellDetail?: boolean;     // default true
  showCasingDetail?: boolean;   // default true
  showTubingDetail?: boolean;   // default true

  // Personalización visual
  theme?: Partial<DiagramTheme>;

  // Callbacks
  onElementHover?: (element: WellElement, event: MouseEvent) => void;
  onElementClick?: (element: WellElement) => void;
}

interface SimplifiedDiagramProps {
  well: Well;
  theme?: Partial<SimplifiedTheme>;
}
```

### Tema / personalización

```typescript
interface DiagramTheme {
  // Casings
  casingFill: string;
  casingStroke: string;
  casingStrokeWidth: number;
  linerPattern: string;

  // Tubing
  tubingStroke: string;
  tubingStrokeWidth: number;

  // Perforaciones
  shootColor: string;
  slotColor: string;

  // Pump icons
  pumpFill: string;

  // Mandrels GL
  mandrelWithValve: string;    // default '#27ae60'
  mandrelWithoutValve: string; // default '#7f8c8d'

  // Labels
  labelFontSize: number;
  labelFontFamily: string;

  // Detail blocks
  detailHeaderBg: string;      // default '#2c3e50'
  detailAccentColor: string;   // default '#e74c3c'
}
```

---

## 3. Plan de Implementación

### Fase 1: Preparar monorepo

**Objetivo:** Establecer la estructura de directorios sin romper nada.

- [ ] 1.1 Inicializar workspace (npm/pnpm workspaces) en la raíz
- [ ] 1.2 Crear `packages/react-well-diagram/` con `package.json`, `tsconfig.json`
- [ ] 1.3 Crear `packages/demo-app/` con `package.json`, `tsconfig.json`
- [ ] 1.4 Mover archivos de la app actual a `packages/demo-app/`
- [ ] 1.5 Verificar que la app sigue funcionando desde `packages/demo-app/`

### Fase 2: Extraer librería — tipos y hooks

**Objetivo:** Mover tipos, hooks y utilidades a la librería sin lógica de componentes todavía.

- [ ] 2.1 Copiar `src/types/` a `packages/react-well-diagram/src/types/`
- [ ] 2.2 Copiar `src/hooks/use-diagram-config.ts` a la librería
- [ ] 2.3 Copiar `src/utils/well-factory.ts` a la librería
- [ ] 2.4 Crear `packages/react-well-diagram/src/index.ts` con exports de tipos y hooks
- [ ] 2.5 Actualizar `demo-app` para importar tipos desde la librería
- [ ] 2.6 Verificar que la app sigue funcionando

### Fase 3: Desacoplar stores → props

**Objetivo:** Refactorizar `WellDiagram` y sus layers para que la visibilidad sea controlada por props, no por Zustand.

- [ ] 3.1 Definir interfaces `WellDiagramProps` y `SimplifiedDiagramProps`
- [ ] 3.2 Refactorizar `LabelsLayer` — recibir visibilidad como prop en vez de leer `useLabelsStore`
- [ ] 3.3 Refactorizar `WellDetailLayer` — recibir `showWellDetail`, `showCasingDetail`, `showTubingDetail` como props
- [ ] 3.4 Refactorizar `WellDiagram` — aceptar `labels` prop, pasar visibilidad a cada layer
- [ ] 3.5 Actualizar `demo-app` para pasar labels desde `useLabelsStore` al componente via props
- [ ] 3.6 Verificar que la app sigue funcionando igual

### Fase 4: Extraer componentes de diagrama a la librería

**Objetivo:** Mover todos los componentes de rendering a la librería.

- [ ] 4.1 Mover `WellDiagram.tsx` y todos los layers, icons, elements a la librería
- [ ] 4.2 Mover `SimplifiedDiagram` y sus layers a la librería
- [ ] 4.3 Mover `SvgDefs.tsx`, `Tooltip.tsx` a la librería
- [ ] 4.4 Actualizar `demo-app` para importar componentes desde la librería
- [ ] 4.5 Verificar que la app sigue funcionando

### Fase 5: Sistema de temas

**Objetivo:** Reemplazar colores hardcodeados con un theme configurable.

- [ ] 5.1 Definir `DiagramTheme` interface y `defaultTheme` con los colores actuales
- [ ] 5.2 Crear `ThemeContext` interno en la librería
- [ ] 5.3 Reemplazar constantes de color en cada layer por valores del theme
- [ ] 5.4 Agregar `theme` prop a `WellDiagram` y `SimplifiedDiagram`
- [ ] 5.5 Verificar que sin theme prop, todo se ve igual (default theme)

### Fase 6: Build de librería

**Objetivo:** Configurar Vite en library mode para generar ESM + CJS + tipos.

- [ ] 6.1 Configurar `vite.config.ts` en la librería con `build.lib`
- [ ] 6.2 Configurar `rollupOptions.external` para excluir React
- [ ] 6.3 Configurar generación de `.d.ts` (via `vite-plugin-dts` o `tsc`)
- [ ] 6.4 Configurar `package.json` con `main`, `module`, `types`, `exports`, `peerDependencies`
- [ ] 6.5 Ejecutar build y verificar output (ESM, CJS, tipos)
- [ ] 6.6 Verificar que `demo-app` consume el build correctamente

### Fase 7: Documentación y publicación

**Objetivo:** Preparar la librería para consumo externo.

- [ ] 7.1 Escribir README con: instalación, uso básico, props API, ejemplos
- [ ] 7.2 Agregar ejemplo mínimo de uso
- [ ] 7.3 Configurar `.npmignore` o `files` en package.json
- [ ] 7.4 Elegir nombre del paquete (ej: `@nabep/react-well-diagram`, `react-well-completion`)
- [ ] 7.5 Publicar primer release en npm

---

## 4. Decisiones pendientes

| Decisión | Opciones | Recomendación |
|---|---|---|
| **Gestor de workspace** | npm workspaces / pnpm / turborepo | pnpm — más rápido, mejor soporte de workspaces |
| **Nombre del paquete** | `react-well-diagram` / `@nabep/well-diagram` / otro | Definir antes de publicar |
| **Tooltip interno vs externo** | Tooltip como parte de la librería o callback al consumidor | Callback (`onElementHover`) — más flexible |
| **Monorepo vs repos separados** | Todo en un repo / librería en repo propio | Monorepo al inicio, separar después si crece |
| **Soporte SSR** | Necesario para Next.js / no necesario | No prioritario, agregar después si hay demanda |

---

## 5. Estimación de complejidad por fase

| Fase | Descripción | Archivos afectados | Complejidad |
|---|---|---|---|
| 1 | Monorepo | Config files | Baja |
| 2 | Extraer tipos/hooks | ~10 archivos | Baja |
| 3 | Desacoplar stores | ~5 layers + WellDiagram | **Media-Alta** |
| 4 | Mover componentes | ~20 archivos (mover) | Baja |
| 5 | Sistema de temas | ~15 layers + theme file | Media |
| 6 | Build de librería | Config files | Baja |
| 7 | Documentación | README + examples | Baja |

**La Fase 3 es la más crítica** — es donde se rompe el acoplamiento con Zustand. Todo lo demás es mayormente mover archivos y configurar builds.
