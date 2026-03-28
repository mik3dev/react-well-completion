# CI Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lint, typecheck, test, and build validation to every PR and push that touches the library.

**Architecture:** One GitHub Actions workflow with 4 parallel+sequential jobs. Vitest as test runner with jsdom. ESLint config for the library. Smoke tests to bootstrap the test suite.

**Tech Stack:** GitHub Actions, Vitest, @testing-library/react, jsdom, ESLint

**Spec:** `docs/superpowers/specs/2026-03-28-ci-pipeline-design.md`

---

## File Map

| File | Responsibility |
|---|---|
| `packages/react-well-completion/package.json` | Add test/lint scripts + devDependencies |
| `packages/react-well-completion/vite.config.ts` | Add Vitest test config |
| `packages/react-well-completion/eslint.config.js` | ESLint config for library |
| `packages/react-well-completion/src/__tests__/smoke.test.tsx` | Smoke tests |
| `.github/workflows/ci.yml` | CI workflow |

---

## Task 1: Install test dependencies and configure Vitest

**Files:**
- Modify: `packages/react-well-completion/package.json`
- Modify: `packages/react-well-completion/vite.config.ts`

- [ ] **Step 1: Install test dependencies**

Run from repo root:

```bash
pnpm --filter @mik3dev/react-well-completion add -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add test scripts to package.json**

In `packages/react-well-completion/package.json`, update the `scripts` section:

```json
"scripts": {
  "build": "vite build",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint src/"
}
```

- [ ] **Step 3: Add Vitest config to vite.config.ts**

Update `packages/react-well-completion/vite.config.ts` — add the `test` section and the `/// <reference>` directive:

```typescript
/// <reference types="vitest/config" />
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
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

- [ ] **Step 4: Verify vitest runs (no tests yet, should report 0)**

```bash
pnpm --filter @mik3dev/react-well-completion test
```

Expected: `No test files found` or similar — no error.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest with jsdom for library testing"
```

---

## Task 2: Add ESLint config for library

**Files:**
- Create: `packages/react-well-completion/eslint.config.js`

- [ ] **Step 1: Install ESLint dependencies**

```bash
pnpm --filter @mik3dev/react-well-completion add -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

- [ ] **Step 2: Create eslint.config.js**

Create `packages/react-well-completion/eslint.config.js`:

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

- [ ] **Step 3: Run lint to verify**

```bash
pnpm --filter @mik3dev/react-well-completion lint
```

Expected: Either passes clean or shows warnings/errors. Fix any errors that block CI (unused imports, etc.). Warnings are OK for now.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add ESLint config for react-well-completion library"
```

---

## Task 3: Write smoke tests

**Files:**
- Create: `packages/react-well-completion/src/__tests__/smoke.test.tsx`

- [ ] **Step 1: Create smoke test file**

Create `packages/react-well-completion/src/__tests__/smoke.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  WellDiagram,
  SimplifiedDiagram,
  createWell,
  createCasing,
  createPerforation,
  LABEL_CATEGORIES,
  ALL_LABEL_CATEGORIES,
  defaultTheme,
} from '../index';

describe('Library exports', () => {
  it('exports WellDiagram component', () => {
    expect(WellDiagram).toBeDefined();
    expect(typeof WellDiagram).toBe('function');
  });

  it('exports SimplifiedDiagram component', () => {
    expect(SimplifiedDiagram).toBeDefined();
    expect(typeof SimplifiedDiagram).toBe('function');
  });

  it('exports LABEL_CATEGORIES with all entries', () => {
    expect(LABEL_CATEGORIES).toBeDefined();
    expect(LABEL_CATEGORIES.length).toBe(ALL_LABEL_CATEGORIES.length);
    for (const cat of LABEL_CATEGORIES) {
      expect(cat).toHaveProperty('key');
      expect(cat).toHaveProperty('label');
    }
  });

  it('exports defaultTheme with required colors', () => {
    expect(defaultTheme).toHaveProperty('headerBg');
    expect(defaultTheme).toHaveProperty('accent');
    expect(defaultTheme).toHaveProperty('headerText');
  });
});

describe('createWell factory', () => {
  it('creates a well with correct defaults', () => {
    const well = createWell('Pozo-001', 'BM');

    expect(well.id).toBeDefined();
    expect(well.id.length).toBeGreaterThan(0);
    expect(well.name).toBe('Pozo-001');
    expect(well.liftMethod).toBe('BM');
    expect(well.casings).toEqual([]);
    expect(well.tubingString).toEqual([]);
    expect(well.rodString).toEqual([]);
    expect(well.pump).toBeNull();
    expect(well.mandrels).toEqual([]);
    expect(well.wire).toBeNull();
  });

  it('creates wells with unique IDs', () => {
    const well1 = createWell('A', 'GL');
    const well2 = createWell('B', 'GL');

    expect(well1.id).not.toBe(well2.id);
  });
});

describe('WellDiagram render', () => {
  it('renders without crashing with minimal well data', () => {
    const well = createWell('Test', 'BM');

    const { container } = render(<WellDiagram well={well} />);

    expect(container).toBeDefined();
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('renders with casings and perforations', () => {
    const well = {
      ...createWell('Test-Full', 'BM'),
      totalDepth: 5000,
      totalFreeDepth: 4800,
      casings: [
        createCasing({ diameter: 9.625, top: 0, base: 3000, isLiner: false }),
        createCasing({ diameter: 7, top: 0, base: 5000, isLiner: false }),
      ],
      perforations: [
        createPerforation({ top: 4600, base: 4700, type: 'shoot' }),
      ],
    };

    const { container } = render(<WellDiagram well={well} />);

    expect(container.querySelector('div')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter @mik3dev/react-well-completion test
```

Expected: All 7 tests pass.

If `ResizeObserver is not defined` error occurs (jsdom doesn't support it), add a mock at the top of the test file:

```typescript
// Add before imports if needed:
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: add smoke tests for library exports, factories, and render"
```

---

## Task 4: Create CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create ci.yml**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
    paths:
      - 'packages/react-well-completion/**'
  push:
    branches: [main]
    paths:
      - 'packages/react-well-completion/**'

permissions:
  contents: read

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm --filter @mik3dev/react-well-completion lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        working-directory: packages/react-well-completion
        run: npx tsc --noEmit

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm --filter @mik3dev/react-well-completion test

  build:
    name: Build
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build library
        run: pnpm build:lib

      - name: Verify no store leaks in bundle
        run: |
          if grep -c "zustand" packages/react-well-completion/dist/index.js; then
            echo "ERROR: zustand found in library bundle"
            exit 1
          fi
          if grep -c "html-to-image" packages/react-well-completion/dist/index.js; then
            echo "ERROR: html-to-image found in library bundle"
            exit 1
          fi
          echo "No store leaks detected"
```

- [ ] **Step 2: Verify workflow syntax**

```bash
cat .github/workflows/ci.yml | head -5
```

Expected: Shows the `name: CI` header. (No YAML linter available locally, but GitHub will validate on push.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint, typecheck, test, and build workflow for library"
```

---

## Task 5: Verify everything locally and push

**Files:** None (verification only)

- [ ] **Step 1: Run all checks locally in sequence**

```bash
pnpm --filter @mik3dev/react-well-completion lint
pnpm --filter @mik3dev/react-well-completion test
cd packages/react-well-completion && npx tsc --noEmit && cd ../..
pnpm build:lib
```

Expected: All 4 pass with no errors.

- [ ] **Step 2: Push to trigger CI**

```bash
git push origin main
```

Expected: CI workflow triggers on GitHub (since we pushed changes to `packages/react-well-completion/**`).

- [ ] **Step 3: Commit (if any fixes were needed)**

Only if previous steps required fixes:

```bash
git add -A
git commit -m "fix: resolve CI issues found during local verification"
git push origin main
```
