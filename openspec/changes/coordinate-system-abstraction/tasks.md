## 1. Modelo de datos y tipos

- [ ] 1.1 Agregar campos `orientation?: 'vertical' | 'horizontal'`, `halfSection?: boolean`, `halfSide?: 'right' | 'left'` al `Well` interface en `src/types/well.ts`
- [ ] 1.2 Extender `DiagramConfig` en `src/types/diagram.ts` con: `orientation`, `halfSection`, `halfSide`, `centerLine`, `depthToPos`, `diameterToSpan`
- [ ] 1.3 Ampliar `updateWellMeta` en `src/store/well-store.ts` para aceptar los 3 campos nuevos

## 2. Funciones abstractas de coordenadas

- [ ] 2.1 Implementar `depthToPos` en `useDiagramConfig`: en vertical delega a `depthToY`, en horizontal mapea depth al eje X con gamma correction
- [ ] 2.2 Implementar `diameterToSpan` en `useDiagramConfig`: retorna `{ a, b }` según orientación y halfSection/halfSide
- [ ] 2.3 Refactorizar `diameterToX` como alias de `diameterToSpan` que retorna `{ x1: a, x2: b }`
- [ ] 2.4 Implementar `computeCasingSpans` que delega a `computeCasingPositions` y adapta resultado a `{ a, b }`
- [ ] 2.5 Calcular `centerLine` en `useDiagramConfig` según orientación

## 3. Migración de layers (vertical idéntico)

- [ ] 3.1 Migrar **DepthAxisLayer** a usar `depthToPos` y `config.orientation`
- [ ] 3.2 Migrar **SandLayer** a usar `depthToPos` y `diameterToSpan`
- [ ] 3.3 Migrar **EarthLayer** a usar `depthToPos` y `diameterToSpan`
- [ ] 3.4 Migrar **CasingLayer** a usar `depthToPos` y `computeCasingSpans`
- [ ] 3.5 Migrar **PerforationLayer** a usar `depthToPos` y `diameterToSpan`
- [ ] 3.6 Migrar **TubingLayer** a usar `depthToPos` y `diameterToSpan`
- [ ] 3.7 Migrar **RodLayer** a usar `depthToPos` y `config.centerLine`
- [ ] 3.8 Migrar **WireLayer** a usar `depthToPos` y `diameterToSpan`
- [ ] 3.9 Migrar **PumpLayer** a usar `depthToPos` y `config.centerLine`
- [ ] 3.10 Migrar **AccessoriesLayer** a usar `depthToPos`, `diameterToSpan` y `computeCasingSpans`
- [ ] 3.11 Migrar **LabelsLayer** a usar `depthToPos`, `diameterToSpan` y `computeCasingSpans`
- [ ] 3.12 Migrar **WellDetailLayer** — sin cambios funcionales (usa config.width directamente)

## 4. Controles de UI

- [ ] 4.1 Agregar selector de orientación (Vertical/Horizontal) en sección "Información General" del `WellEditor.tsx`
- [ ] 4.2 Agregar toggle de media sección con selector de lado (Derecha/Izquierda) en `WellEditor.tsx`

## 5. Verificación

- [ ] 5.1 Verificar build sin errores TypeScript (`npm run build`)
- [ ] 5.2 Verificar visualmente los 4 pozos de ejemplo en modo vertical (sin regresiones)
- [ ] 5.3 Verificar que controles de orientación y media sección aparecen en el editor
