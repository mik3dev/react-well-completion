## 1. Modelo de datos

- [x] 1.1 Agregar campos `latitude?`, `longitude?`, `estacionFlujo?`, `mesaRotaria?` a la interfaz `Well` en `src/types/well.ts`
- [x] 1.2 Ampliar tipo de `updateWellMeta` en `src/store/well-store.ts` para incluir los 4 campos nuevos

## 2. Labels store

- [x] 2.1 Agregar `wellDetail` a `LabelCategory` y `LABEL_CATEGORIES` en `src/store/labels-store.ts`

## 3. Componente WellDetailLayer

- [x] 3.1 Crear `src/components/diagram/layers/WellDetailLayer.tsx` con title-block SVG: header oscuro, filas label/valor, posición top-right, guard de ancho mínimo, toggle via labels store
- [x] 3.2 Importar y renderizar `WellDetailLayer` como último layer en `src/components/diagram/WellDiagram.tsx`

## 4. Editor UI

- [x] 4.1 Agregar inputs de Latitud, Longitud, Estación de Flujo y Mesa Rotaria en la sección "Información General" de `src/components/editor/WellEditor.tsx`

## 5. Datos de ejemplo

- [x] 5.1 Agregar valores de metadatos realistas a los 4 pozos de ejemplo en `src/data/example-wells.ts`

## 6. Verificación

- [x] 6.1 Verificar build sin errores TypeScript (`npm run build`)
- [ ] 6.2 Verificar visualmente la leyenda en el diagrama con `npm run dev`
