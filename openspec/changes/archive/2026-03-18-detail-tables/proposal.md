## Why

El diagrama de completación muestra visualmente los equipos del pozo, pero no incluye tablas de datos técnicos de casings ni tuberías. Los ingenieros necesitan ver estos detalles (diámetros, pesos, grados, profundidades, longitudes) directamente en el diagrama exportado, sin tener que consultar otras fuentes.

## What Changes

- Agregar un title-block "DETALLE DE CASING" con tabla de todos los casings: diámetro (fraccional), peso, grado, tope, base, tipo (casing/liner)
- Agregar un title-block "DETALLE DE TUBERÍAS" con tabla de segmentos de tubing: segmento, diámetro, longitud, profundidad acumulada; más fila de bomba si existe
- Ambos bloques se apilan debajo del "DETALLE DE POZO" existente, con visibilidad independiente via toggles
- Refactorizar WellDetailLayer para extraer un componente `DetailBlock` reutilizable (header, zebra rows, shadow)

## Capabilities

### New Capabilities
- `casing-detail-table`: Tabla SVG con datos técnicos de cada casing (diámetro, peso, grado, tope, base, tipo)
- `tubing-detail-table`: Tabla SVG con datos técnicos de cada segmento de tubing (segmento, diámetro, longitud, profundidad acumulada) y bomba

### Modified Capabilities
- `well-detail-legend`: Refactorizar para extraer componente DetailBlock reutilizable y manejar apilamiento vertical de múltiples bloques

## Impact

- `src/components/diagram/layers/WellDetailLayer.tsx` — refactorización mayor para soportar múltiples bloques apilados
- `src/store/labels-store.ts` — 2 nuevas categorías de toggle: `casingDetail`, `tubingDetail`
- No hay cambios en tipos de datos (`Well`, `Casing`, `TubingSegment` ya tienen todos los campos necesarios)
- Las exportaciones PNG/SVG incluyen automáticamente los nuevos bloques (están dentro del SVG)
