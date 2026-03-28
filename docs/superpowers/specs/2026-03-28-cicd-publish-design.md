# Design: CI/CD para publicar react-well-completion en GitHub Packages

## Objetivo

Automatizar la publicacion de la libreria `react-well-completion` en GitHub Packages (npm registry privado) usando versionado semantico basado en conventional commits.

## Decisiones de Diseno

| Decision | Eleccion | Razon |
|---|---|---|
| Herramienta de versioning | release-please (Google) | Changelog automatico, Release PRs como gate de revision |
| Trigger principal | Push a main → Release PR → merge → publish | Flujo estandar, revisable antes de publicar |
| Trigger manual | workflow_dispatch con selector patch/minor/major | Hotfixes urgentes sin esperar Release PR |
| Bump logic | Conventional commits (feat=minor, fix=patch, BREAKING=major) | Estandar de la industria, parseable automaticamente |
| Registry | GitHub Packages (npm.pkg.github.com) | Privado, usa GITHUB_TOKEN nativo, transicion trivial a npm publico |
| Scope | Solo libreria (react-well-completion) | demo-app no se deploya |

---

## Flujo Normal (release-please)

```
1. Developer trabaja en feat/branch con conventional commits
2. Mergea PR a main
3. release-please analiza commits y crea/actualiza Release PR:
   - Titulo: "chore(main): release react-well-completion 0.2.0"
   - Body: CHANGELOG generado automaticamente
   - Bumps version en package.json
4. Developer revisa Release PR y lo mergea
5. Al mergear:
   - Se crea tag (v0.2.0)
   - Job "publish" se dispara
   - Libreria se publica en GitHub Packages
```

## Flujo Hotfix (manual)

```
1. Developer va a Actions → "Publish Library (manual)"
2. Selecciona bump type: patch / minor / major
3. Workflow ejecuta:
   - pnpm install + build
   - npm version <bump> en package.json
   - npm publish a GitHub Packages
   - Commit + tag + push
```

---

## Archivos

### `.github/workflows/release-please.yml`

Dos jobs:
1. **release-please** — Usa `googleapis/release-please-action@v4` para crear/actualizar Release PRs. Configurado con `release-type: node`, `path: packages/react-well-completion`. Emite output `release_created` y `tag_name`.
2. **publish** — Solo corre si `release_created == true`. Hace checkout, setup pnpm 9 + node 20, `pnpm install --frozen-lockfile`, `pnpm build:lib`, `pnpm --filter react-well-completion publish --no-git-checks` con `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.

Permisos: `contents: write`, `pull-requests: write`, `packages: write`.

### `.github/workflows/publish-manual.yml`

Un job con workflow_dispatch:
- Input: `bump` (choice: patch/minor/major)
- Steps: checkout (fetch-depth 0), setup pnpm 9 + node 20, install, build, `npm version $bump --no-git-tag-version`, `npm publish`, commit bump + tag + push.
- Git config usa `github-actions[bot]` como author.

Permisos: `contents: write`, `packages: write`.

### `release-please-config.json` (raiz)

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

- `bump-minor-pre-major`: mientras version < 1.0.0, `feat:` hace minor bump (no major)
- `bump-patch-for-minor-pre-major`: `fix:` hace patch pre-1.0
- CHANGELOG generado dentro de `packages/react-well-completion/CHANGELOG.md`
- Solo trackea commits que tocan `packages/react-well-completion/`

### `.release-please-manifest.json` (raiz)

```json
{
  "packages/react-well-completion": "0.1.0"
}
```

Version actual de la libreria. release-please lo actualiza automaticamente en cada release.

---

## Requisitos

- **Repo en GitHub** con remote configurado
- **Conventional commits** en todos los PRs que tocan la libreria
- **GitHub Packages** habilitado en el repo (habilitado por defecto)
- No se necesitan secrets adicionales — `GITHUB_TOKEN` es suficiente

## Fuera de Alcance

- Deploy de demo-app (GitHub Pages, Vercel, etc.)
- CI para tests (no hay test runner configurado)
- Notificaciones de release (Slack, email, etc.)
- Publicacion en npm publico (se hara cuando el repo sea open source)
