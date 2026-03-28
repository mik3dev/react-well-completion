# Design: CI Pipeline para react-well-completion

## Objetivo

Agregar validacion automatica (lint, typecheck, test, build) en cada PR y push a main que toque la libreria, para garantizar calidad antes de publicar.

## Decisiones de Diseno

| Decision | Eleccion | Razon |
|---|---|---|
| Estructura | Un solo workflow con path filters | Simple, sin dependencias externas |
| Jobs | lint + typecheck + test (paralelos) → build (secuencial) | Feedback rapido, build solo si todo pasa |
| Test runner | Vitest | Mismo ecosistema Vite, config minima |
| Scope de tests | 3 smoke tests iniciales | Minimo viable, mas tests se agregan progresivamente |
| Path filter | `packages/react-well-completion/**` | Cambios en demo-app no disparan CI |
| Branch protection | Solo job `build` como required | No bloquea PRs que solo tocan demo-app |

---

## Workflow `.github/workflows/ci.yml`

Triggers:
- `pull_request` a `main` con path `packages/react-well-completion/**`
- `push` a `main` con path `packages/react-well-completion/**`

Jobs:
1. **lint** — `eslint src/` en la libreria
2. **typecheck** — `tsc --noEmit` en la libreria
3. **test** — `vitest run` en la libreria
4. **build** — `pnpm build:lib` (depende de lint + typecheck + test)

Todos usan: pnpm 9, Node 20, `pnpm install --frozen-lockfile`.

---

## Vitest Config

Agregado al `vite.config.ts` existente de la libreria:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
}
```

DevDependencies nuevas en la libreria:
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `jsdom`

Scripts nuevos en `packages/react-well-completion/package.json`:
- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"lint": "eslint src/"`

---

## Tests Iniciales

Archivo: `packages/react-well-completion/src/__tests__/smoke.test.tsx`

3 smoke tests:

1. **Exports** — Verifica que `WellDiagram`, `SimplifiedDiagram`, `createWell`, `LABEL_CATEGORIES`, `defaultTheme` se exportan correctamente desde el index
2. **Factory** — `createWell('Test', 'BM')` produce un objeto con `id`, `name`, `liftMethod`, `casings: []`, etc.
3. **Render** — `<WellDiagram well={createWell('Test', 'BM')} />` renderiza sin crash

---

## ESLint Config

Archivo: `packages/react-well-completion/eslint.config.js`

Config basico TypeScript + React para la libreria, mismas reglas que demo-app.

---

## Branch Protection (manual, post-implementacion)

En GitHub Settings → Branches → Add rule para `main`:
- Require status checks to pass: **`build`**
- El job `build` solo aparece si el PR toca la libreria (path filter)
- PRs que solo tocan demo-app no son bloqueados

## Fuera de Alcance

- Tests de la demo-app
- Coverage reports / thresholds
- E2E tests
- CI para la demo-app
