# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript compile (tsc -b) then Vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured.

## Architecture

This is a **Well Completion Diagram Visualization Tool** for oil & gas engineers. It renders interactive SVG diagrams of downhole well equipment and supports 4 lift methods: `BM` (beam pump), `BCP` (progressing cavity pump), `BES` (electric submersible pump), `GL` (gas lift).

### State Management (Zustand)

Two stores with localStorage persistence:

- **`useWellStore`** (`src/store/well-store.ts`) — CRUD for wells and selection state. Generic `addElement`/`updateElement`/`removeElement` methods operate on any array field of a `Well` by key name (e.g., `'casings'`, `'perforations'`).
- **`useLabelsStore`** (`src/store/labels-store.ts`) — toggles visibility for 10 label categories on the diagram.

### SVG Rendering

`WellDiagram.tsx` orchestrates ~11 stacked SVG layer components. Each layer receives:
- The current `Well` data
- A `DiagramConfig` from `useDiagramConfig` hook — contains `pulgada` (px/inch of diameter), `pxPerFt` (px/foot), `centerX`, `maxDepth`

Coordinate system: horizontal is symmetric from `centerX` using diameter; vertical maps depth directly to Y (0 = top, increasing downward).

### Data Model

The `Well` interface (`src/types/well.ts`) is the central type. Key lift-method-conditional fields:
- `rodString` / `pump` — only used for BM/BCP
- `wire` — only for BES
- `mandrels` — only for GL

Use factory functions in `src/utils/well-factory.ts` (`createWell`, `createCasing`, `createPump`, etc.) when creating new well component objects — they assign UUIDs and handle defaults.

### UI Language

The UI is in **Spanish**. Labels, placeholders, and user-facing strings should be Spanish. Some variable names also use Spanish (e.g., `pulgada` for inches, `pies` for feet).

### Export

`useExport` hook (`src/hooks/use-export.ts`) supports PNG, SVG (via `html-to-image`), clipboard copy, and JSON download.
