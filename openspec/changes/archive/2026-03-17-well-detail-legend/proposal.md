## Why

El diagrama de completación carece de un bloque de información del pozo — dato estándar en planos de ingeniería petrolera. Los ingenieros necesitan ver de un vistazo nombre, ubicación, estación de flujo, elevación de mesa rotaria, profundidad total y profundidad libre (HUD) directamente en el diagrama, especialmente al exportar PNG/SVG para reportes.

## What Changes

- Agregar campos opcionales de metadatos al modelo `Well`: `latitude`, `longitude`, `estacionFlujo`, `mesaRotaria`
- Crear un nuevo layer SVG `WellDetailLayer` que renderiza un title-block profesional en la esquina superior derecha del diagrama
- Agregar inputs de edición en el sidebar para los nuevos campos de metadatos
- Hacer la leyenda toggleable desde el dropdown de "Etiquetas"
- Agregar datos de ejemplo a los pozos existentes

## Capabilities

### New Capabilities
- `well-detail-legend`: Renderizado SVG de un bloque "Detalle de Pozo" con metadatos del pozo, posicionado en el diagrama y exportable con PNG/SVG
- `well-metadata`: Campos opcionales de metadatos del pozo (coordenadas, estación de flujo, mesa rotaria) con edición en sidebar

### Modified Capabilities

_(ninguna — no se alteran requisitos de capacidades existentes)_

## Impact

- **Modelo de datos**: `Well` interface gana 4 campos opcionales — backward-compatible con localStorage y JSON existentes
- **Store**: `updateWellMeta` amplía su tipo para aceptar nuevos campos
- **Labels store**: Nueva categoría `wellDetail` para toggle de visibilidad
- **SVG rendering**: Nuevo layer encima de todos los demás
- **Editor UI**: 4 inputs adicionales en sección "Información General"
- **Datos de ejemplo**: Valores de muestra para los 4 pozos
