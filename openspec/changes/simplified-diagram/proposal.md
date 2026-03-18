## Why

Los ingenieros necesitan una versión esquemática y minimalista del diagrama de pozo para usar como referencia visual en reportes de gradientes de presión/temperatura y análisis acústico (ej: Echometer). El diagrama detallado actual tiene demasiada información para estos contextos — se necesita uno simplificado, en escala de grises, que muestre solo los elementos estructurales esenciales.

## What Changes

- Crear un nuevo componente `SimplifiedDiagram` independiente del diagrama principal, con su propia estructura de sub-componentes
- Renderizar solo elementos esenciales: casings (paredes simples), tubing (líneas), perforaciones (líneas horizontales), empacaduras, bomba (rectángulo), eje de profundidad
- Excluir: arenas, earth fill, cable BES, rods, gas anchors, sleeves, nipples, plugs, mandrels, labels inline, tooltips
- Paleta exclusivamente en escala de grises (negro, grises, blanco)
- Siempre vertical, no interactivo
- Componente reutilizable para integrar en diferentes contextos (reportes, paneles laterales)

## Capabilities

### New Capabilities
- `simplified-diagram`: Componente SVG independiente que renderiza una versión esquemática y minimalista del pozo en escala de grises

### Modified Capabilities

## Impact

- Nueva carpeta `src/components/simplified-diagram/` con 7 archivos nuevos
- Modificar `src/App.tsx` para integrar vista del diagrama simplificado (panel o vista alternativa)
- Reutiliza `useDiagramConfig` existente para coordenadas
- No modifica tipos de datos ni stores existentes
