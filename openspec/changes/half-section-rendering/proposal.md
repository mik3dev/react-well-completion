## Why

Los ingenieros de completación frecuentemente necesitan ver el pozo en corte transversal (media sección) para planos técnicos y reportes. La infraestructura de coordenadas abstractas (`diameterToSpan`, `centerLine`, `halfSection`) ya está implementada, pero los layers aún dibujan ambos lados simétricamente. Cada layer necesita adaptarse para renderizar solo el lado visible cuando `halfSection === true`.

## What Changes

- Adaptar los 12 layers SVG para renderizar solo una mitad del pozo cuando `halfSection` está activo
- Casings: una sola pared, shoe parcial
- Tubing: una sola línea de pared
- Rods: mitad del rectángulo
- Pump: media bomba
- Perforaciones, accessories: solo el lado visible
- Dibujar línea de eje central punteada en `centerLine`
- Ajustar labels al espacio disponible en media sección

## Capabilities

### New Capabilities
- `half-section-rendering`: Renderizado de media sección del pozo (corte transversal), mostrando solo la mitad derecha o izquierda con línea de eje central

### Modified Capabilities

_(ninguna)_

## Impact

- **12 layer components** en `src/components/diagram/layers/` — cada uno agrega lógica condicional para `config.halfSection`
- **`src/components/diagram/WellDiagram.tsx`** — posible adición de layer de línea de eje central
- Sin cambios en modelo de datos ni store (ya implementados en Sección 1)
