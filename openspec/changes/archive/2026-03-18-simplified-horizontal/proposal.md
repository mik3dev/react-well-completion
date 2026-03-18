## Why

El diagrama simplificado actualmente solo soporta orientación vertical. El diagrama principal ya soporta horizontal via SVG rotation transform. El simplificado debe ofrecer la misma capacidad para ser consistente y usable en contextos donde el pozo es horizontal.

## What Changes

- Agregar soporte de orientación horizontal al componente `SimplifiedDiagram` usando la misma estrategia de rotación SVG del diagrama principal
- Swap de dimensiones cuando `well.orientation === 'horizontal'`
- Eje de profundidad horizontal renderizado fuera del grupo rotado

## Capabilities

### New Capabilities

### Modified Capabilities
- `simplified-diagram`: Agregar soporte de orientación horizontal via SVG rotation transform

## Impact

- `src/components/simplified-diagram/SimplifiedDiagram.tsx` — único archivo modificado
- Sin cambios en layers internos, tipos, ni stores
