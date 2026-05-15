# Tasks

- [x] 1. Cambiar criterio de `EarthLayer.tsx`: top = `max(non-liner shoes)` en lugar de HUD
- [x] 2. Agregar prop `fill?: string` a `EarthLayer` con default `'url(#earthFill)'`
- [x] 3. Agregar `earthFill` a `BrandTheme` (default `'url(#earthFill)'`)
- [x] 4. Pasar `mergedTheme.earthFill` desde `WellDiagram` a `EarthLayer`
- [x] 5. Importar y renderizar `EarthLayer` en `SimplifiedDiagram`
- [x] 6. Agregar prop `earthFill?: string` a `SimplifiedDiagramProps` (default `'transparent'`)
- [x] 7. Smoke tests para el nuevo criterio (con/sin non-liner, override de fill, simplified default vs override)
- [x] 8. Actualizar READMEs (lib + root)
- [x] 9. OpenSpec change record
