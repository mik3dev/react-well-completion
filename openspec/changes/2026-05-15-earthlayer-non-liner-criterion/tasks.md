# Tasks

- [x] 1. Cambiar criterio de `EarthLayer.tsx`: top = `max(non-liner shoes)` en lugar de HUD
- [x] 2. Agregar prop `fill?: string` a `EarthLayer` con default `'url(#earthFill)'`
- [x] 3. Agregar `earthFill` a `BrandTheme` (default `'url(#earthFill)'`)
- [x] 4. Pasar `mergedTheme.earthFill` desde `WellDiagram` a `EarthLayer`
- [x] 5. Importar y renderizar `EarthLayer` en `SimplifiedDiagram`
- [x] 6. Agregar prop `earthFill?: string` a `SimplifiedDiagramProps` (default `'transparent'`)
- [x] 7. Smoke tests para el nuevo criterio (con/sin non-liner, override de fill, simplified default vs override)
- [x] 8. `parseBackendWell` infiere `isLiner: true` para items de `Casing[]` con `Tope > 0` (con tests)
- [x] 9. Cleanup: re-clasificar el 7" como liner en `vlg3922-backend.json`
- [x] 10. Actualizar READMEs (lib + root)
- [x] 11. OpenSpec change record
