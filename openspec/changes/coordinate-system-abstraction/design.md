## Context

El diagrama SVG de completación usa 12 layers que llaman directamente a `depthToY(depth)` (depth → Y) y `diameterToX(config, diameter)` (diameter → `{x1, x2}` simétrico desde `centerX`). La función `depthToY` aplica gamma correction (γ=1.5) para comprimir profundidades. `computeCasingPositions` calcula posiciones esquemáticas de casings, simétricas desde `centerX`.

Para soportar orientación horizontal y medio pozo sin dispersar condicionales en cada layer, se necesita una capa de abstracción que mapee "profundidad" y "diámetro" a ejes genéricos.

## Goals / Non-Goals

**Goals:**
- Crear funciones abstractas `depthToPos` y `diameterToSpan` en `DiagramConfig`
- En modo vertical, `depthToPos` ≡ `depthToY` y `diameterToSpan` ≡ `diameterToX` (zero visual regression)
- En modo horizontal, `depthToPos` mapea depth al eje X; `diameterToSpan` al eje Y
- En modo half-section, `diameterToSpan` retorna solo una mitad
- Migrar los 12 layers a usar las funciones abstractas
- UI controls para orientación y half-section

**Non-Goals:**
- Implementar la renderización horizontal completa de cada layer (eso es Sección 3)
- Implementar la renderización half-section de cada layer (eso es Sección 2)
- Panel de perfiles (Sección 4)
- Cambiar el aspecto visual actual del diagrama vertical

## Decisions

### 1. Funciones abstractas en DiagramConfig (no wrapper externo)

**Decisión:** Agregar `depthToPos`, `diameterToSpan`, `orientation`, `halfSection`, `halfSide`, `centerLine` directamente al `DiagramConfig` interface.

**Razón:** Todos los layers ya reciben `config: DiagramConfig`. No se necesita un nuevo provider o context — se extiende lo existente. Los layers migran gradualmente.

**Alternativa descartada:** React Context para orientación — agrega complejidad sin beneficio, los layers ya tienen `config`.

### 2. `diameterToSpan` retorna `{ a, b }` (no `{ x1, x2 }`)

**Decisión:** La función abstracta usa nombres genéricos `a` (lado menor) y `b` (lado mayor) en vez de `x1`/`x2`, porque en horizontal `a`/`b` son posiciones Y.

**Razón:** Evita confusión semántica — `x1` implica eje X, pero en horizontal es eje Y. Los layers que usen `diameterToSpan` destructuran `{ a, b }` y los asignan al eje correcto.

**Nota:** `diameterToX` se mantiene como alias que llama `diameterToSpan` y retorna `{ x1: a, x2: b }` para backward compatibility durante migración.

### 3. Migración gradual (no big-bang)

**Decisión:** En esta fase, todos los layers se migran a `depthToPos`/`diameterToSpan`, pero el resultado visual es idéntico al actual (vertical, full section). La funcionalidad horizontal y half-section se activa en fases posteriores.

**Razón:** Reduce riesgo de regresiones. Se puede verificar visualmente que cada layer migrado produce el mismo resultado.

### 4. Campos en Well (no en config global)

**Decisión:** `orientation`, `halfSection`, `halfSide` son campos del `Well`, no de un config global.

**Razón:** Permite que cada pozo tenga su propia configuración de visualización. Al exportar JSON, los settings de visualización viajan con el pozo.

### 5. `computeCasingSpans` como wrapper de `computeCasingPositions`

**Decisión:** `computeCasingSpans(casings, config)` llama internamente a `computeCasingPositions` y adapta el resultado según orientación/halfSection.

**Razón:** La lógica de spacing esquemático (inside-out) no cambia — solo el mapeo final a coordenadas físicas.

## Risks / Trade-offs

- **Regresión visual durante migración** → Mitigación: migrar layer por layer, verificar visualmente cada uno con los 4 pozos de ejemplo antes de continuar
- **`depthToY` sigue disponible** → En vertical, `depthToPos` === `depthToY`, así que layers no migrados siguen funcionando. No hay urgencia de migrar todo de golpe.
- **Performance** → Las funciones abstractas son wrappers delgados, impacto negligible
