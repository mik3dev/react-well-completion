# CI/CD Publish Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate publishing `react-well-completion` to GitHub Packages using release-please and a manual workflow_dispatch fallback.

**Architecture:** Two GitHub Actions workflows — `release-please.yml` creates Release PRs from conventional commits and publishes on merge; `publish-manual.yml` provides a manual trigger for hotfixes. release-please config files at repo root control versioning behavior.

**Tech Stack:** GitHub Actions, release-please v4, pnpm 9, Node 20, GitHub Packages (npm)

**Spec:** `docs/superpowers/specs/2026-03-28-cicd-publish-design.md`

---

## File Map

| File | Responsibility |
|---|---|
| `.github/workflows/release-please.yml` | Auto Release PR + publish on merge |
| `.github/workflows/publish-manual.yml` | Manual hotfix publish with version bump |
| `release-please-config.json` | release-please package config |
| `.release-please-manifest.json` | Current version tracker |

---

## Task 1: Create release-please config files

**Files:**
- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`

- [ ] **Step 1: Create release-please-config.json**

Create `release-please-config.json` at the repo root:

```json
{
  "packages": {
    "packages/react-well-completion": {
      "release-type": "node",
      "package-name": "react-well-completion",
      "changelog-path": "CHANGELOG.md",
      "bump-minor-pre-major": true,
      "bump-patch-for-minor-pre-major": true
    }
  }
}
```

- [ ] **Step 2: Create .release-please-manifest.json**

Create `.release-please-manifest.json` at the repo root:

```json
{
  "packages/react-well-completion": "0.1.0"
}
```

- [ ] **Step 3: Commit**

```bash
git add release-please-config.json .release-please-manifest.json
git commit -m "chore: add release-please config for react-well-completion"
```

---

## Task 2: Create release-please workflow

**Files:**
- Create: `.github/workflows/release-please.yml`

- [ ] **Step 1: Create .github/workflows directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create release-please.yml**

Create `.github/workflows/release-please.yml`:

```yaml
name: Release Please

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write
  packages: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs['packages/react-well-completion--release_created'] }}
      tag_name: ${{ steps.release.outputs['packages/react-well-completion--tag_name'] }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

  publish:
    needs: release-please
    if: ${{ needs.release-please.outputs.release_created }}
    runs-on: ubuntu-latest
    permissions:
      packages: write
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://npm.pkg.github.com

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build library
        run: pnpm build:lib

      - name: Publish to GitHub Packages
        run: pnpm --filter react-well-completion publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Note: When using release-please with a monorepo manifest config, the outputs use the pattern `packages/<path>--<output_name>`. The action reads `release-please-config.json` and `.release-please-manifest.json` automatically — no `release-type`, `package-name`, or `path` inputs needed in the workflow.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release-please.yml
git commit -m "ci: add release-please workflow for automated publishing"
```

---

## Task 3: Create manual publish workflow

**Files:**
- Create: `.github/workflows/publish-manual.yml`

- [ ] **Step 1: Create publish-manual.yml**

Create `.github/workflows/publish-manual.yml`:

```yaml
name: Publish Library (manual)

on:
  workflow_dispatch:
    inputs:
      bump:
        description: 'Version bump type'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major

permissions:
  contents: write
  packages: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://npm.pkg.github.com

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build library
        run: pnpm build:lib

      - name: Bump version
        working-directory: packages/react-well-completion
        run: npm version ${{ inputs.bump }} --no-git-tag-version

      - name: Publish to GitHub Packages
        working-directory: packages/react-well-completion
        run: npm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit version bump and tag
        run: |
          VERSION=$(node -p "require('./packages/react-well-completion/package.json').version")
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add packages/react-well-completion/package.json
          git commit -m "chore: release react-well-completion v${VERSION}"
          git tag "v${VERSION}"
          git push origin main --tags
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/publish-manual.yml
git commit -m "ci: add manual publish workflow for hotfixes"
```

---

## Task 4: Update .release-please-manifest after manual publish

**Context:** If a manual publish bumps the version to e.g. `0.1.1`, release-please's manifest still says `0.1.0`. The next release-please run would try to create a release for `0.1.1` again, causing a conflict.

**Fix:** The manual workflow must also update the manifest.

**Files:**
- Modify: `.github/workflows/publish-manual.yml`

- [ ] **Step 1: Add manifest update step to publish-manual.yml**

In `.github/workflows/publish-manual.yml`, add this step after the "Bump version" step and before the "Commit version bump and tag" step:

```yaml
      - name: Update release-please manifest
        run: |
          VERSION=$(node -p "require('./packages/react-well-completion/package.json').version")
          echo "{\"packages/react-well-completion\": \"${VERSION}\"}" > .release-please-manifest.json
```

- [ ] **Step 2: Update the commit step to include the manifest**

In the "Commit version bump and tag" step, update the `git add` line:

```yaml
      - name: Commit version bump and tag
        run: |
          VERSION=$(node -p "require('./packages/react-well-completion/package.json').version")
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add packages/react-well-completion/package.json .release-please-manifest.json
          git commit -m "chore: release react-well-completion v${VERSION}"
          git tag "v${VERSION}"
          git push origin main --tags
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish-manual.yml
git commit -m "fix: sync release-please manifest on manual publish"
```
