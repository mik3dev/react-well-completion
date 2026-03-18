## Why

Se requiere diagramar el pozo en orientación horizontal — tope del pozo a la izquierda, fondo a la derecha. Este formato es estándar en reportes de pozos horizontales y permite mejor aprovechamiento del espacio en pantallas anchas. La infraestructura abstracta (`depthToPos`, `diameterToSpan`, `centerLine`) ya está implementada (Sección 1), y el half-section funciona (Sección 2). Ahora cada layer necesita adaptar su renderizado SVG para dibujar horizontalmente cuando `orientation === 'horizontal'`.

## What Changes

- Adaptar los 12 layers SVG para renderizar horizontal: líneas verticales → horizontales, depth axis arriba/abajo, equipos rotados
- Adaptar el SVG container (`WellDiagram.tsx`) para layout horizontal (translate, margins)
- Adaptar `SvgDefs` patterns para orientación horizontal
- Labels legibles en horizontal (no rotados)
- Compatible con half-section en horizontal
- Exportación PNG/SVG funciona en horizontal

## Capabilities

### New Capabilities
- `horizontal-rendering`: Renderizado horizontal del diagrama de completación, con tope a la izquierda y fondo a la derecha, labels legibles, y compatible con half-section

### Modified Capabilities

_(ninguna)_

## Impact

- **`src/components/diagram/WellDiagram.tsx`** — layout y transform del SVG
- **12 layer components** — cada uno adapta su rendering para orientación horizontal
- **`src/components/diagram/SvgDefs.tsx`** — patterns rotados para horizontal
- **`src/hooks/use-export.ts`** — aspect ratio para exportación horizontal
- Sin cambios en modelo de datos ni store (ya tienen `orientation` field)
