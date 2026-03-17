## 1. Data Model

- [x] 1.1 Agregar `weight?: number` y `grade?: string` a la interfaz `Casing` en `src/types/well.ts`
- [x] 1.2 Actualizar `createCasing` en `src/utils/well-factory.ts` con defaults `weight: undefined, grade: undefined`

## 2. Editor

- [x] 2.1 Agregar columnas "Peso (lb/ft)" y "Grado" a la tabla de casings en `WellEditor.tsx`, vinculadas a `weight` y `grade`

## 3. ShoeIcon rediseño

- [x] 3.1 Reescribir `ShoeIcon.tsx`: triángulo sólido apuntando hacia afuera, sin círculo de cemento
  - Left: apex en esquina inferior-izquierda (borde exterior), base en parte superior del shoe
  - Right: espejo del left

## 4. HangerIcon nuevo

- [x] 4.1 Crear `src/components/diagram/icons/HangerIcon.tsx`: barra horizontal con dos orejas/flanges apuntando hacia abajo, representando el colgador
- [x] 4.2 Exportar `HangerIcon` desde `src/components/diagram/icons/index.ts`

## 5. CasingLayer: hanger + label inline

- [x] 5.1 En `CasingLayer.tsx`, renderizar `HangerIcon` en `depthToY(casing.top)` cuando `casing.top > 0`
- [x] 5.2 En `CasingLayer.tsx`, renderizar label inline junto a cada casing con formato `Rev. {d}" #{weight} {grade} a {base}'`, omitiendo campos ausentes
- [x] 5.3 Desplazar el inicio del muro del casing por `hangerH` cuando hay hanger (para crear la separación visual)

## 6. Verificación

- [x] 6.1 Confirmar build limpio (`npm run build`)
- [ ] 6.2 Revisar visualmente: zapata triangular, colgador en liners, label inline
