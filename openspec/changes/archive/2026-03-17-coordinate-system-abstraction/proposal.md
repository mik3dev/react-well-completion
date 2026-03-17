## Why

El sistema de coordenadas del diagrama está hardcoded a orientación vertical (`depthToY` → eje Y, `diameterToX` → eje X). Se requiere soportar orientación horizontal y medio pozo (half-section), pero cada layer (12 en total) llama directamente a estas funciones. Sin una capa de abstracción, implementar orientación horizontal y medio pozo requeriría condicionales dispersos en cada layer. Esta abstracción es el prerequisito para los tres requerimientos solicitados: horizontal, medio pozo, y panel de perfiles.

## What Changes

- Introducir funciones abstractas `depthToPos` y `diameterToSpan` en `DiagramConfig` que mapean profundidad y diámetro al eje primario/secundario según orientación
- Agregar campos `orientation` (`vertical` | `horizontal`), `halfSection` (boolean), `halfSide` (`right` | `left`) al modelo `Well` y `DiagramConfig`
- **BREAKING** (interno): Los 12 layers migrarán gradualmente de `depthToY`/`diameterToX` a `depthToPos`/`diameterToSpan` — en esta fase solo se construye la infraestructura y se migran los layers existentes manteniendo comportamiento vertical idéntico
- Agregar controles de orientación y medio pozo al editor UI
- Agregar `computeCasingSpans()` como versión abstracta de `computeCasingPositions()`

## Capabilities

### New Capabilities
- `coordinate-abstraction`: Funciones abstractas de mapeo de coordenadas (`depthToPos`, `diameterToSpan`) que desacoplan depth/diameter de ejes X/Y físicos, soportando orientación vertical/horizontal y sección completa/media
- `diagram-orientation`: Controles de UI y modelo de datos para seleccionar orientación del diagrama (vertical/horizontal) y modo de sección (completa/media)

### Modified Capabilities

_(ninguna — las capacidades existentes mantienen su comportamiento actual; la migración interna no cambia requisitos de spec)_

## Impact

- **`src/types/diagram.ts`** — `DiagramConfig` gana nuevos campos y funciones
- **`src/types/well.ts`** — `Well` gana 3 campos opcionales (orientation, halfSection, halfSide)
- **`src/hooks/use-diagram-config.ts`** — Nuevas funciones de mapeo abstracto, nueva `computeCasingSpans`
- **`src/store/well-store.ts`** — Ampliar `updateWellMeta` con nuevos campos
- **`src/components/editor/WellEditor.tsx`** — Controles de orientación y medio pozo
- **12 layer components** — Migrar de `depthToY`/`diameterToX` a `depthToPos`/`diameterToSpan` (mantiendo resultado visual idéntico en vertical)
