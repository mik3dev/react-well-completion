## Context

El diagrama principal (`WellDiagram.tsx`) soporta orientación horizontal con esta estrategia:
1. Detecta `isH = well.orientation === 'horizontal'`
2. Swap dimensiones: `configW = size.height - 100`, `configH = size.width - 50`
3. Grupo rotado: `translate(45, ${30 + config.width}) rotate(-90)`
4. Eje de profundidad vertical dentro del grupo (solo !isH)
5. Eje de profundidad horizontal fuera del grupo (solo isH)

El `SimplifiedDiagram` actual usa `translate(35, 0)` fijo y no detecta orientación.

## Goals / Non-Goals

**Goals:**
- Replicar la estrategia de rotación SVG en SimplifiedDiagram
- Los layers internos no cambian (la rotación los maneja)

**Non-Goals:**
- No se modifica ningún layer simplificado
- No se agrega half-section al simplificado

## Decisions

### 1. Misma estrategia de rotación

**Decisión:** Usar exactamente el mismo patrón que WellDiagram: swap dims, rotate(-90), eje horizontal externo. Márgenes más pequeños (35px left, 20px top) porque el simplificado es más compacto.

## Risks / Trade-offs

- Ningún riesgo significativo — es replicar un patrón probado en un componente más simple.
