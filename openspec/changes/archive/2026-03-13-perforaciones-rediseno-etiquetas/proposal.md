## Why

Las zonas cañoneadas se representan actualmente con flechas horizontales simples que no se corresponden con la simbología estándar de diagramas mecánicos de pozos. Adicionalmente, el modelo de datos no permite asociar las perforaciones a un yacimiento o arena, información crítica para la interpretación del diagrama.

## What Changes

- Rediseño visual del `PerforationLayer`: líneas horizontales densas que atraviesan la pared del casing, alineadas con la imagen de referencia de la industria
- Nuevo campo `yacimiento` (opcional) en el tipo `Perforation`: nombre del yacimiento/reservorio
- Nuevo campo `arena` (opcional) en el tipo `Perforation`: nombre de la arena o sub-zona productora
- Etiquetas agrupadas en el lado izquierdo del diagrama: corchetes por yacimiento → sub-corchetes por arena → lista de intervalos con espesores
- Nueva categoría `yacimientos` en `useLabelsStore` para controlar visibilidad de estas etiquetas
- Actualización del formulario de edición de perforaciones para incluir los nuevos campos

## Capabilities

### New Capabilities

- `perforation-visual`: Representación visual de intervalos cañoneados con líneas horizontales que cruzan la pared del casing, con zona coloreada y límites de intervalo
- `perforation-formation-labels`: Etiquetas jerárquicas en el lado izquierdo del diagrama mostrando yacimiento → arena → intervalos con espesor calculado

### Modified Capabilities

- `perforation-data-model`: El tipo `Perforation` incorpora dos nuevos campos opcionales (`yacimiento`, `arena`) sin ser breaking ya que son opcionales

## Impact

- `src/types/well.ts` — Agregar campos opcionales a `Perforation`
- `src/utils/well-factory.ts` — Actualizar `createPerforation()`
- `src/components/diagram/layers/PerforationLayer.tsx` — Rediseño visual completo
- `src/components/diagram/layers/LabelsLayer.tsx` — Agregar renderizado de etiquetas de yacimiento/arena
- `src/store/labels-store.ts` — Nueva categoría `yacimientos`
- `src/components/editor/` — Actualizar formulario de edición de perforaciones
