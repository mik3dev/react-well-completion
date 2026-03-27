# react-well-completion Library Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract diagram components into a publishable `react-well-completion` npm library within a pnpm monorepo.

**Architecture:** Monorepo with `packages/react-well-completion` (library) and `packages/demo-app` (current app). Library exports pure React components that receive data via props — no stores, no DOM export utilities. Brand theme configurable via 3 colors.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7 (library mode), pnpm workspaces, vite-plugin-dts, GitHub Packages

**Spec:** `docs/superpowers/specs/2026-03-27-library-migration-design.md`

---

## File Map

### New files (library)

| File | Responsibility |
|---|---|
| `pnpm-workspace.yaml` | Workspace config |
| `packages/react-well-completion/package.json` | Library package manifest |
| `packages/react-well-completion/tsconfig.json` | Library TS config |
| `packages/react-well-completion/vite.config.ts` | Vite library mode build |
| `packages/react-well-completion/src/index.ts` | Public API exports |
| `packages/react-well-completion/src/theme.ts` | BrandTheme interface + defaults |

### Moved files (from `src/` to `packages/react-well-completion/src/`)

| Source | Destination |
|---|---|
| `src/types/well.ts` | `packages/react-well-completion/src/types/well.ts` |
| `src/types/diagram.ts` | `packages/react-well-completion/src/types/diagram.ts` |
| `src/types/index.ts` | `packages/react-well-completion/src/types/index.ts` |
| `src/hooks/use-diagram-config.ts` | `packages/react-well-completion/src/hooks/use-diagram-config.ts` |
| `src/utils/well-factory.ts` | `packages/react-well-completion/src/utils/well-factory.ts` |
| `src/components/diagram/WellDiagram.tsx` | `packages/react-well-completion/src/components/WellDiagram.tsx` |
| `src/components/diagram/SvgDefs.tsx` | `packages/react-well-completion/src/components/SvgDefs.tsx` |
| `src/components/diagram/Tooltip.tsx` | `packages/react-well-completion/src/components/Tooltip.tsx` |
| `src/components/diagram/layers/*` | `packages/react-well-completion/src/components/layers/*` |
| `src/components/diagram/icons/*` | `packages/react-well-completion/src/components/icons/*` |
| `src/components/diagram/elements/*` | `packages/react-well-completion/src/components/elements/*` |
| `src/components/simplified-diagram/*` | `packages/react-well-completion/src/components/simplified/*` |

### Modified files (demo-app)

| File | Change |
|---|---|
| `packages/demo-app/src/App.tsx` | Import from `react-well-completion`, pass `labels` prop |
| `packages/demo-app/src/store/labels-store.ts` | Import `LabelCategory` type from library |
| `packages/demo-app/src/components/Toolbar.tsx` | Import `LABEL_CATEGORIES` from library |

---

## Task 1: Initialize pnpm workspace

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `packages/react-well-completion/package.json`
- Create: `packages/demo-app/package.json`
- Modify: `package.json` (root — convert to workspace root)

- [ ] **Step 1: Install pnpm globally if not available**

Run: `npm ls -g pnpm || npm install -g pnpm`

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 3: Create root package.json for workspace**

Replace the current root `package.json` with a workspace root:

```json
{
  "name": "well-completion-diagram",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter demo-app dev",
    "build": "pnpm --filter react-well-completion build && pnpm --filter demo-app build",
    "build:lib": "pnpm --filter react-well-completion build",
    "lint": "pnpm --filter demo-app lint"
  }
}
```

- [ ] **Step 4: Create packages directories**

Run: `mkdir -p packages/react-well-completion/src packages/demo-app`

- [ ] **Step 5: Create library package.json**

Create `packages/react-well-completion/package.json`:

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
  "devDependencies": {
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^5.1.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "~5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "files": ["dist"],
  "license": "MIT"
}
```

- [ ] **Step 6: Move current app to packages/demo-app**

Run the following commands to move the app while preserving the root workspace:

```bash
# Move app source files to demo-app
mv src packages/demo-app/src
mv index.html packages/demo-app/index.html
mv vite.config.ts packages/demo-app/vite.config.ts
mv tsconfig.app.json packages/demo-app/tsconfig.app.json
mv tsconfig.node.json packages/demo-app/tsconfig.node.json
mv eslint.config.js packages/demo-app/eslint.config.js
```

- [ ] **Step 7: Create demo-app package.json**

Create `packages/demo-app/package.json`:

```json
{
  "name": "demo-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "html-to-image": "^1.11.13",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-well-completion": "workspace:*",
    "uuid": "^13.0.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.48.0",
    "vite": "^7.3.1"
  }
}
```

- [ ] **Step 8: Create demo-app tsconfig.json**

Create `packages/demo-app/tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 9: Remove old root tsconfig.json and replace**

Remove old `tsconfig.json` (it was for the app) and optionally create an empty one or leave it absent — the demo-app has its own now.

Run: `rm tsconfig.json`

- [ ] **Step 10: Remove old root node_modules and lock file, install fresh**

```bash
rm -rf node_modules package-lock.json
pnpm install
```

- [ ] **Step 11: Verify demo-app runs**

Run: `pnpm dev`
Expected: Vite dev server starts, app loads at localhost:5173 with no errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: initialize pnpm monorepo with demo-app package"
```

---

## Task 2: Create library scaffold with types, hooks, and utils

**Files:**
- Create: `packages/react-well-completion/tsconfig.json`
- Create: `packages/react-well-completion/vite.config.ts`
- Create: `packages/react-well-completion/src/theme.ts`
- Create: `packages/react-well-completion/src/index.ts`
- Move: `types/`, `hooks/use-diagram-config.ts`, `utils/well-factory.ts` from demo-app to library

- [ ] **Step 1: Create library tsconfig.json**

Create `packages/react-well-completion/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Create library vite.config.ts**

Create `packages/react-well-completion/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    dts({ rollupTypes: true }),
  ],
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

- [ ] **Step 3: Move types to library**

```bash
mkdir -p packages/react-well-completion/src/types
mv packages/demo-app/src/types/well.ts packages/react-well-completion/src/types/well.ts
mv packages/demo-app/src/types/diagram.ts packages/react-well-completion/src/types/diagram.ts
mv packages/demo-app/src/types/index.ts packages/react-well-completion/src/types/index.ts
```

- [ ] **Step 4: Add LabelCategory type to library types**

Add to `packages/react-well-completion/src/types/well.ts` at the end of the file:

```typescript
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
```

- [ ] **Step 5: Update types/index.ts to export LabelCategory**

Update `packages/react-well-completion/src/types/index.ts`:

```typescript
export type * from './well';
export { ALL_LABEL_CATEGORIES, LABEL_CATEGORIES } from './well';
export type { DiagramConfig } from './diagram';
```

- [ ] **Step 6: Move hooks to library**

```bash
mkdir -p packages/react-well-completion/src/hooks
mv packages/demo-app/src/hooks/use-diagram-config.ts packages/react-well-completion/src/hooks/use-diagram-config.ts
```

Update the import path in `use-diagram-config.ts`: change `../../types` references to `../types`.

- [ ] **Step 7: Move utils to library**

```bash
mkdir -p packages/react-well-completion/src/utils
mv packages/demo-app/src/utils/well-factory.ts packages/react-well-completion/src/utils/well-factory.ts
```

Update the import path in `well-factory.ts`: change `../types` references to `../types`.

- [ ] **Step 8: Create theme.ts**

Create `packages/react-well-completion/src/theme.ts`:

```typescript
export interface BrandTheme {
  headerBg: string;
  accent: string;
  headerText: string;
}

export const defaultTheme: BrandTheme = {
  headerBg: '#205394',
  accent: '#377AF3',
  headerText: '#FFFFFF',
};
```

- [ ] **Step 9: Create initial index.ts (types/hooks/utils only for now)**

Create `packages/react-well-completion/src/index.ts`:

```typescript
// Types
export type {
  Well, LiftMethod, DiagramOrientation, HalfSide,
  Casing, TubingSegment, RodSegment, Pump, Packer,
  SeatNipple, Plug, GasAnchor, Mandrel, Sleeve,
  Packing, Perforation, Sand, Wire,
  LabelCategory,
} from './types';
export type { DiagramConfig } from './types';
export { ALL_LABEL_CATEGORIES, LABEL_CATEGORIES } from './types';
export type { BrandTheme } from './theme';
export { defaultTheme } from './theme';

// Factories
export {
  createWell, createCasing, createTubingSegment,
  createRodSegment, createPump, createPacker,
  createSeatNipple, createPlug, createGasAnchor,
  createMandrel, createSleeve, createPacking,
  createPerforation, createSand, createWire,
} from './utils/well-factory';

// Hook
export { useDiagramConfig, diameterToX, computeCasingPositions, computeCasingSpans } from './hooks/use-diagram-config';
```

- [ ] **Step 10: Create re-export shim in demo-app for types**

Create `packages/demo-app/src/types/index.ts` as a re-export from the library:

```typescript
export type * from 'react-well-completion';
export type { DiagramConfig } from 'react-well-completion';
```

Remove `packages/demo-app/src/types/well.ts` and `packages/demo-app/src/types/diagram.ts` — they now live in the library.

- [ ] **Step 11: Update demo-app labels-store.ts**

Replace the `LabelCategory` definition and `LABEL_CATEGORIES` array with imports from the library:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LabelCategory } from 'react-well-completion';
import { LABEL_CATEGORIES } from 'react-well-completion';

export type { LabelCategory };
export { LABEL_CATEGORIES };

interface LabelsStore {
  visible: Record<LabelCategory, boolean>;
  toggle: (category: LabelCategory) => void;
  showAll: () => void;
  hideAll: () => void;
}

const allVisible = (): Record<LabelCategory, boolean> =>
  Object.fromEntries(LABEL_CATEGORIES.map(c => [c.key, false])) as Record<LabelCategory, boolean>;

export const useLabelsStore = create<LabelsStore>()(
  persist(
    (set) => ({
      visible: allVisible(),

      toggle: (category) => set(s => ({
        visible: { ...s.visible, [category]: !s.visible[category] },
      })),

      showAll: () => set({
        visible: Object.fromEntries(LABEL_CATEGORIES.map(c => [c.key, true])) as Record<LabelCategory, boolean>,
      }),

      hideAll: () => set({ visible: allVisible() }),
    }),
    { name: 'well-labels-visibility' }
  )
);
```

- [ ] **Step 12: Update all demo-app import paths**

Search all files in `packages/demo-app/src/` for imports from `../../types`, `../types`, `../../hooks/use-diagram-config`, `../../utils/well-factory` etc. and update to either import from `react-well-completion` or from the local re-export shim. Key files:

- `packages/demo-app/src/store/well-store.ts` — import types from `react-well-completion`
- `packages/demo-app/src/data/example-wells.ts` — import factories from `react-well-completion`
- `packages/demo-app/src/components/editor/WellEditor.tsx` — import types from `react-well-completion`
- `packages/demo-app/src/components/Toolbar.tsx` — import `LABEL_CATEGORIES` from `react-well-completion`
- All diagram layers still under `packages/demo-app/src/components/diagram/` — update `../../../types` to `react-well-completion` and `../../../hooks/use-diagram-config` to `react-well-completion`

Run: `grep -r "from '.*types" packages/demo-app/src/ --include="*.ts" --include="*.tsx"` to find all import paths that need updating.

- [ ] **Step 13: Install dependencies and verify**

```bash
pnpm install
pnpm dev
```

Expected: App starts, no import errors. Types resolve correctly from the library.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: extract types, hooks, and utils to react-well-completion library"
```

---

## Task 3: Decouple stores from diagram layers (props instead of Zustand)

**Files:**
- Modify: `packages/demo-app/src/components/diagram/layers/LabelsLayer.tsx`
- Modify: `packages/demo-app/src/components/diagram/layers/WellDetailLayer.tsx`
- Modify: `packages/demo-app/src/components/diagram/WellDiagram.tsx`
- Modify: `packages/demo-app/src/App.tsx`

- [ ] **Step 1: Refactor LabelsLayer to receive visible as prop**

In `packages/demo-app/src/components/diagram/layers/LabelsLayer.tsx`:

Remove the import:
```typescript
import { useLabelsStore } from '../../../store/labels-store';
```

Add `visible` to the Props interface:
```typescript
import type { DiagramConfig, Well, LabelCategory } from 'react-well-completion';

interface Props {
  well: Well;
  config: DiagramConfig;
  minCasingDiameter: number;
  visible: Record<LabelCategory, boolean>;
}
```

Replace the `useLabelsStore` call inside the component:
```typescript
// REMOVE this line:
// const visible = useLabelsStore(s => s.visible);

// The `visible` prop is now destructured from Props:
export default function LabelsLayer({ well, config, minCasingDiameter, visible }: Props) {
```

The rest of the component stays exactly the same — all `visible.casings`, `visible.tubing`, etc. references work unchanged because `visible` is now a prop with the same shape.

- [ ] **Step 2: Refactor WellDetailLayer to receive visible as prop**

In `packages/demo-app/src/components/diagram/layers/WellDetailLayer.tsx`:

Remove the import:
```typescript
import { useLabelsStore } from '../../../store/labels-store';
```

Add `visible` to the Props interface:
```typescript
import type { DiagramConfig, Well, LiftMethod, LabelCategory } from 'react-well-completion';

interface Props {
  well: Well;
  config: DiagramConfig;
  visible: Record<LabelCategory, boolean>;
}
```

Replace the `useLabelsStore` call inside the component:
```typescript
// REMOVE this line inside the function body:
// const visible = useLabelsStore(s => s.visible);

// Destructure from props:
export default function WellDetailLayer({ well, config, visible }: Props) {
```

The rest of the component stays exactly the same.

- [ ] **Step 3: Update WellDiagram to accept and pass labels prop**

In `packages/demo-app/src/components/diagram/WellDiagram.tsx`:

Update the Props interface:
```typescript
import type { Well, LabelCategory } from 'react-well-completion';
import { ALL_LABEL_CATEGORIES } from 'react-well-completion';

interface Props {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;
}
```

Add label merging at the top of the component:
```typescript
export default function WellDiagram({ well, labels }: Props) {
  const defaultLabels = Object.fromEntries(
    ALL_LABEL_CATEGORIES.map(k => [k, true])
  ) as Record<LabelCategory, boolean>;
  const mergedLabels = { ...defaultLabels, ...labels };
```

Pass `visible` prop to LabelsLayer (line ~100):
```typescript
<LabelsLayer well={well} config={config} minCasingDiameter={minCasingDiameter} visible={mergedLabels} />
```

Pass `visible` prop to WellDetailLayer (line ~141):
```typescript
<WellDetailLayer well={well} config={{
  ...config,
  width: size.width - 50,
  height: size.height,
}} visible={mergedLabels} />
```

- [ ] **Step 4: Update App.tsx to pass labels from store**

In `packages/demo-app/src/App.tsx`:

```typescript
import { useWellStore } from './store/well-store';
import { useLabelsStore } from './store/labels-store';
import Toolbar from './components/Toolbar';
import WellSelector from './components/editor/WellSelector';
import WellEditor from './components/editor/WellEditor';
import WellDiagram from './components/diagram/WellDiagram';
import { SimplifiedDiagram } from './components/simplified-diagram';
import './App.css';

export default function App() {
  const well = useWellStore(s => s.wells.find(w => w.id === s.selectedWellId));
  const visible = useLabelsStore(s => s.visible);
  const [showSimplified, setShowSimplified] = useState(false);

  return (
    <div className="app">
      <Toolbar showSimplified={showSimplified} onToggleSimplified={() => setShowSimplified(s => !s)} />
      <div className="app__body">
        <aside className="app__sidebar">
          <WellSelector />
          <WellEditor />
        </aside>
        <main className="app__diagram">
          {well ? (
            showSimplified
              ? <SimplifiedDiagram well={well} />
              : <WellDiagram well={well} labels={visible} />
          ) : (
            <div className="app__placeholder">
              <p>Selecciona o crea un pozo para visualizar el diagrama</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify app works identically**

Run: `pnpm dev`
Expected: Labels toggle on/off exactly as before. Detail blocks show/hide. No console errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: decouple LabelsLayer and WellDetailLayer from Zustand store"
```

---

## Task 4: Move diagram components to library

**Files:**
- Move: All files under `packages/demo-app/src/components/diagram/` to `packages/react-well-completion/src/components/`
- Move: All files under `packages/demo-app/src/components/simplified-diagram/` to `packages/react-well-completion/src/components/simplified/`
- Modify: `packages/react-well-completion/src/index.ts` — add component exports
- Modify: `packages/demo-app/src/App.tsx` — import from library

- [ ] **Step 1: Move main diagram components**

```bash
# Create target directories
mkdir -p packages/react-well-completion/src/components/layers
mkdir -p packages/react-well-completion/src/components/icons
mkdir -p packages/react-well-completion/src/components/elements

# Move main files
mv packages/demo-app/src/components/diagram/WellDiagram.tsx packages/react-well-completion/src/components/WellDiagram.tsx
mv packages/demo-app/src/components/diagram/SvgDefs.tsx packages/react-well-completion/src/components/SvgDefs.tsx
mv packages/demo-app/src/components/diagram/Tooltip.tsx packages/react-well-completion/src/components/Tooltip.tsx

# Move layers
mv packages/demo-app/src/components/diagram/layers/* packages/react-well-completion/src/components/layers/

# Move icons
mv packages/demo-app/src/components/diagram/icons/* packages/react-well-completion/src/components/icons/

# Move elements (if directory has files)
mv packages/demo-app/src/components/diagram/elements/* packages/react-well-completion/src/components/elements/ 2>/dev/null || true

# Remove empty directories
rm -rf packages/demo-app/src/components/diagram
```

- [ ] **Step 2: Move simplified diagram components**

```bash
mkdir -p packages/react-well-completion/src/components/simplified

mv packages/demo-app/src/components/simplified-diagram/* packages/react-well-completion/src/components/simplified/

rm -rf packages/demo-app/src/components/simplified-diagram
```

- [ ] **Step 3: Fix all import paths in moved files**

In all moved component files, update relative imports:

- `../../types` or `../../../types` → `../types` (within library)
- `../../hooks/use-diagram-config` or `../../../hooks/use-diagram-config` → `../hooks/use-diagram-config`
- `./layers/...` → `./layers/...` (no change needed within WellDiagram since layers stay relative)
- `./Tooltip` → `./Tooltip` (stays the same)
- `./SvgDefs` → `./SvgDefs` (stays the same)

For `WellDiagram.tsx` specifically, update:
```typescript
import type { Well, LabelCategory } from '../types';
import { ALL_LABEL_CATEGORIES } from '../types';
import { useDiagramConfig } from '../hooks/use-diagram-config';
import { TooltipProvider } from './Tooltip';
import SvgDefs from './SvgDefs';
import SandLayer from './layers/SandLayer';
// ... etc
```

For each layer file (e.g., `layers/LabelsLayer.tsx`), update:
```typescript
import type { DiagramConfig, Well, LabelCategory } from '../../types';
import { diameterToX, computeCasingPositions } from '../../hooks/use-diagram-config';
```

For simplified components (e.g., `simplified/SimplifiedDiagram.tsx`), update:
```typescript
import type { Well } from '../../types';
import { useDiagramConfig } from '../../hooks/use-diagram-config';
```

Run: `grep -rn "from '.*\.\./.*store" packages/react-well-completion/src/` — this should return ZERO results. No store imports should exist in the library.

- [ ] **Step 4: Update library index.ts with component exports**

Add to `packages/react-well-completion/src/index.ts`:

```typescript
// Components
export { default as WellDiagram } from './components/WellDiagram';
export { default as SimplifiedDiagram } from './components/simplified/SimplifiedDiagram';
```

Also add the WellDiagramProps and SimplifiedDiagramProps types. Add these types to the components and export them:

In `WellDiagram.tsx`, export the Props interface:
```typescript
export interface WellDiagramProps {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;
}
```

In `SimplifiedDiagram.tsx`, export the Props interface:
```typescript
export interface SimplifiedDiagramProps {
  well: Well;
}
```

Add to `index.ts`:
```typescript
export type { WellDiagramProps } from './components/WellDiagram';
export type { SimplifiedDiagramProps } from './components/simplified/SimplifiedDiagram';
```

- [ ] **Step 5: Update demo-app App.tsx to import from library**

```typescript
import { useState } from 'react';
import { useWellStore } from './store/well-store';
import { useLabelsStore } from './store/labels-store';
import { WellDiagram, SimplifiedDiagram } from 'react-well-completion';
import Toolbar from './components/Toolbar';
import WellSelector from './components/editor/WellSelector';
import WellEditor from './components/editor/WellEditor';
import './App.css';

export default function App() {
  const well = useWellStore(s => s.wells.find(w => w.id === s.selectedWellId));
  const visible = useLabelsStore(s => s.visible);
  const [showSimplified, setShowSimplified] = useState(false);

  return (
    <div className="app">
      <Toolbar showSimplified={showSimplified} onToggleSimplified={() => setShowSimplified(s => !s)} />
      <div className="app__body">
        <aside className="app__sidebar">
          <WellSelector />
          <WellEditor />
        </aside>
        <main className="app__diagram">
          {well ? (
            showSimplified
              ? <SimplifiedDiagram well={well} />
              : <WellDiagram well={well} labels={visible} />
          ) : (
            <div className="app__placeholder">
              <p>Selecciona o crea un pozo para visualizar el diagrama</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Remove demo-app types re-export shim**

The `packages/demo-app/src/types/index.ts` shim from Task 2 can be removed now. All components that used local types are now in the library. Update any remaining demo-app files that imported from `../types` or `../../types` to import from `react-well-completion` instead.

Run: `grep -rn "from '.*types" packages/demo-app/src/ --include="*.ts" --include="*.tsx"` to find remaining local type imports.

- [ ] **Step 7: Verify app works**

Run: `pnpm dev`
Expected: Full diagram renders. Simplified diagram renders. Labels toggle. Detail blocks show/hide. Export works. No console errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: move all diagram components to react-well-completion library"
```

---

## Task 5: Add brand theme support

**Files:**
- Modify: `packages/react-well-completion/src/components/layers/WellDetailLayer.tsx`
- Modify: `packages/react-well-completion/src/components/WellDiagram.tsx`
- Modify: `packages/react-well-completion/src/index.ts`

- [ ] **Step 1: Add theme prop to WellDiagram**

In `packages/react-well-completion/src/components/WellDiagram.tsx`:

```typescript
import type { Well, LabelCategory } from '../types';
import { ALL_LABEL_CATEGORIES } from '../types';
import type { BrandTheme } from '../theme';
import { defaultTheme } from '../theme';

export interface WellDiagramProps {
  well: Well;
  labels?: Partial<Record<LabelCategory, boolean>>;
  theme?: Partial<BrandTheme>;
}

export default function WellDiagram({ well, labels, theme }: WellDiagramProps) {
  const mergedTheme: BrandTheme = { ...defaultTheme, ...theme };
  // ... existing code ...
```

Pass `theme={mergedTheme}` to `WellDetailLayer`:

```typescript
<WellDetailLayer well={well} config={{...}} visible={mergedLabels} theme={mergedTheme} />
```

- [ ] **Step 2: Update WellDetailLayer to use theme**

In `packages/react-well-completion/src/components/layers/WellDetailLayer.tsx`:

Add to Props:
```typescript
import type { BrandTheme } from '../../theme';

interface Props {
  well: Well;
  config: DiagramConfig;
  visible: Record<LabelCategory, boolean>;
  theme: BrandTheme;
}
```

In `KVBlock`, replace hardcoded colors:
```typescript
function KVBlock({ title, rows, x, y, theme }: KVBlockProps & { theme: BrandTheme }) {
  // ...
  // Replace: fill="#205394" → fill={theme.headerBg}
  // Replace: fill="#377AF3" → fill={theme.accent}
  // Replace: fill="white" on header text → fill={theme.headerText}
```

Do the same for `TableBlock`:
```typescript
function TableBlock({ title, headers, colWidths, rows, x, y, theme }: TableBlockProps & { theme: BrandTheme }) {
  // Replace: fill="#205394" → fill={theme.headerBg}
  // Replace: fill="#377AF3" → fill={theme.accent}
  // Replace: fill="white" on header text → fill={theme.headerText}
  // Replace: fill="#205394" on column headers text → fill={theme.headerBg}
```

Pass `theme` through from `WellDetailLayer` to both block components:
```typescript
export default function WellDetailLayer({ well, config, visible, theme }: Props) {
  // ...
  <KVBlock title="DETALLE DE POZO" rows={wellRows} x={x} y={wellY} theme={theme} />
  <TableBlock ... theme={theme} />
  <TableBlock ... theme={theme} />
```

- [ ] **Step 3: Verify default theme matches current appearance**

Run: `pnpm dev`
Expected: Without passing `theme` prop, diagrams look exactly as before (same blue headers, same accent stripe).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add configurable BrandTheme to WellDiagram"
```

---

## Task 6: Configure library build and verify output

**Files:**
- Modify: `packages/react-well-completion/package.json` (if needed)
- Verify: Build output in `packages/react-well-completion/dist/`

- [ ] **Step 1: Run library build**

```bash
pnpm build:lib
```

Expected: Build completes. Output in `packages/react-well-completion/dist/`:
- `index.js` (ESM)
- `index.cjs` (CJS)
- `index.d.ts` (type declarations)

- [ ] **Step 2: Verify type declarations**

Run: `head -50 packages/react-well-completion/dist/index.d.ts`
Expected: Should contain exported interfaces (`Well`, `WellDiagramProps`, `BrandTheme`, etc.)

- [ ] **Step 3: Verify no store imports leaked into bundle**

Run: `grep -c "zustand" packages/react-well-completion/dist/index.js`
Expected: 0 matches

Run: `grep -c "html-to-image" packages/react-well-completion/dist/index.js`
Expected: 0 matches

- [ ] **Step 4: Build demo-app against library build**

```bash
pnpm build
```

Expected: Both library and demo-app build successfully with no TypeScript errors.

- [ ] **Step 5: Verify demo-app preview**

```bash
pnpm --filter demo-app preview
```

Expected: Production build serves correctly at localhost:4173.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: verify library build output (ESM + CJS + types)"
```

---

## Task 7: README and first release preparation

**Files:**
- Create: `packages/react-well-completion/README.md`
- Create: `.npmrc` (root)

- [ ] **Step 1: Create library README**

Create `packages/react-well-completion/README.md`:

```markdown
# react-well-completion

React components for rendering oil & gas well completion diagrams as SVG.

## Installation

```bash
npm install react-well-completion
```

## Usage

```tsx
import { WellDiagram, createWell } from 'react-well-completion';

const well = createWell('Pozo-001', 'BM');

function App() {
  return <WellDiagram well={well} />;
}
```

### Simplified Diagram

```tsx
import { SimplifiedDiagram } from 'react-well-completion';

function App({ well }) {
  return <SimplifiedDiagram well={well} />;
}
```

### Controlling Label Visibility

```tsx
<WellDiagram
  well={well}
  labels={{
    casings: true,
    tubing: true,
    wellDetail: false,
    casingDetail: false,
  }}
/>
```

### Custom Theme

```tsx
<WellDiagram
  well={well}
  theme={{
    headerBg: '#1a1a2e',
    accent: '#e94560',
    headerText: '#ffffff',
  }}
/>
```

## API

### Components

| Component | Props | Description |
|---|---|---|
| `WellDiagram` | `well`, `labels?`, `theme?` | Full detailed diagram with labels and detail blocks |
| `SimplifiedDiagram` | `well` | Grayscale schematic diagram |

### Factory Functions

`createWell`, `createCasing`, `createTubingSegment`, `createPump`, `createPacker`, etc.

### Types

`Well`, `Casing`, `TubingSegment`, `Pump`, `LabelCategory`, `BrandTheme`, `DiagramConfig`, etc.

## License

MIT
```

- [ ] **Step 2: Create root .npmrc for GitHub Packages**

Create `.npmrc`:

```
@mik3dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Note: Adjust the scope (`@mik3dev`) to match your GitHub organization/user. If publishing without a scope, this may need to be adjusted when moving to npm public.

- [ ] **Step 3: Add .gitignore entries**

Ensure these are in the root `.gitignore`:

```
node_modules/
dist/
*.tsbuildinfo
```

- [ ] **Step 4: Verify full workflow**

```bash
pnpm install
pnpm build
pnpm dev
```

Expected: Everything works end-to-end.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add README and npm config for react-well-completion library"
```

- [ ] **Step 6: Tag first pre-release**

```bash
git tag v0.1.0
```

Do NOT push the tag until ready to publish to GitHub Packages.
