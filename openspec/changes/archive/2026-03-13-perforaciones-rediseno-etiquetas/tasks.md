## 1. Modelo de datos

- [x] 1.1 Agregar campos `yacimiento?: string` y `arena?: string` al tipo `Perforation` en `src/types/well.ts`
- [x] 1.2 Actualizar `createPerforation()` en `src/utils/well-factory.ts` para aceptar y pasar los nuevos campos opcionales

## 2. Rediseño visual — PerforationLayer

- [x] 2.X Reemplazar lógica de `shoot` por líneas horizontales que cruzan la pared del casing (`x1 - outerLen` → `x1 + innerOverlap` y `x2 - innerOverlap` → `x2 + outerLen`)
- [x] 2.X Recalcular `numShots` usando `max(3, floor(intervalH / max(pulgada * 0.5, 6)))` para densidad proporcional
- [x] 2.X Eliminar el `rect` de fondo coloreado (zona highlight) para diseño limpio
- [x] 2.X Mantener líneas de límite de intervalo (top/base) con stroke punteado
- [x] 2.5 Verificar visualmente en localhost:5173 con Playwright que las perforaciones lucen correctas

## 3. Store — nueva categoría yacimientos

- [x] 3.1 Agregar `yacimientos: false` al estado inicial de `useLabelsStore` en `src/store/labels-store.ts`
- [x] 3.2 Verificar que `toggle('yacimientos')` funciona con la lógica genérica existente del store

## 4. Etiquetas de yacimiento/arena — LabelsLayer

- [x] 4.X Agregar prop `perforations` a `LabelsLayer` si no la tiene ya (leer `WellDiagram.tsx` para confirmar)
- [x] 4.X Implementar agrupación: `reduce` de perforaciones por `yacimiento`, y dentro de cada grupo por `arena`
- [x] 4.X Renderizar corchete `{` vertical de yacimiento: línea vertical + línea horizontal en tope y base del grupo
- [x] 4.X Renderizar nombre del yacimiento a la izquierda del corchete (texto alineado al centro vertical del grupo)
- [x] 4.X Renderizar sub-corchete de arena con su nombre cuando `arena` está definida
- [x] 4.X Renderizar lista de intervalos: `{top}' - {base}' ({espesor}')` para cada perforation del sub-grupo
- [x] 4.X Envolver todo el bloque de etiquetas de yacimiento en condición `visible.yacimientos`

## 5. Editor UI

- [x] 5.X Localizar el componente de formulario de edición de perforaciones en `src/components/editor/`
- [x] 5.X Agregar input de texto "Yacimiento" ligado al campo `yacimiento` de la perforation
- [x] 5.X Agregar input de texto "Arena" ligado al campo `arena` de la perforation
- [x] 5.X Verificar que el store actualiza correctamente con `updateElement('perforations', id, { yacimiento, arena })`

## 6. Verificación final

- [x] 6.X Verificar en localhost:5173 con Playwright que las etiquetas de yacimiento/arena se muestran al activar el toggle
- [x] 6.X Verificar que pozos existentes sin `yacimiento`/`arena` no muestran errores ni etiquetas vacías
- [x] 6.X Ejecutar `npm run lint` y resolver cualquier error de TypeScript
