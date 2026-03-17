## ADDED Requirements

### Requirement: depthToPos mapea profundidad al eje primario
`DiagramConfig` SHALL proveer una función `depthToPos(depth: number) => number` que mapea profundidad al eje primario del diagrama: eje Y en orientación vertical, eje X en orientación horizontal. MUST aplicar la misma gamma correction (γ=1.5) que `depthToY`.

#### Scenario: Orientación vertical
- **WHEN** `orientation === 'vertical'`
- **THEN** `depthToPos(depth)` retorna el mismo valor que `depthToY(depth)`

#### Scenario: Orientación horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** `depthToPos(depth)` mapea depth al eje X (0 = izquierda/tope, width = derecha/fondo)

### Requirement: diameterToSpan mapea diámetro al eje secundario
`DiagramConfig` SHALL proveer una función `diameterToSpan(diameter: number) => { a: number; b: number }` que mapea diámetro a posiciones en el eje secundario (simétrico desde `centerLine`).

#### Scenario: Vertical, sección completa
- **WHEN** `orientation === 'vertical'` y `halfSection === false`
- **THEN** `diameterToSpan(d)` retorna `{ a: centerX - half, b: centerX + half }` (equivalente a `diameterToX`)

#### Scenario: Vertical, media sección derecha
- **WHEN** `orientation === 'vertical'`, `halfSection === true`, `halfSide === 'right'`
- **THEN** `diameterToSpan(d)` retorna `{ a: centerLine, b: centerLine + half }`

#### Scenario: Vertical, media sección izquierda
- **WHEN** `orientation === 'vertical'`, `halfSection === true`, `halfSide === 'left'`
- **THEN** `diameterToSpan(d)` retorna `{ a: centerLine - half, b: centerLine }`

#### Scenario: Horizontal, sección completa
- **WHEN** `orientation === 'horizontal'` y `halfSection === false`
- **THEN** `diameterToSpan(d)` retorna posiciones en eje Y simétricas desde `centerY`

### Requirement: centerLine indica el eje central del diagrama
`DiagramConfig` SHALL proveer `centerLine: number` que indica la posición central del eje secundario. En vertical es `centerX`, en horizontal es `centerY`.

#### Scenario: Vertical
- **WHEN** `orientation === 'vertical'`
- **THEN** `centerLine === width / 2`

#### Scenario: Horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** `centerLine === height / 2`

### Requirement: computeCasingSpans retorna posiciones esquemáticas abstractas
El sistema SHALL proveer `computeCasingSpans(casings, config)` que retorna un `Map<string, { a: number; b: number }>` con posiciones esquemáticas de casings usando el eje secundario abstracto.

#### Scenario: Vertical, sección completa
- **WHEN** `orientation === 'vertical'` y `halfSection === false`
- **THEN** `computeCasingSpans` retorna valores equivalentes a `computeCasingPositions` (donde `a = x1`, `b = x2`)

#### Scenario: Media sección
- **WHEN** `halfSection === true`
- **THEN** Las posiciones esquemáticas se calculan solo para la mitad indicada por `halfSide`

### Requirement: diameterToX se mantiene como alias backward-compatible
`diameterToX(config, diameter)` SHALL seguir funcionando y retornando `{ x1, x2 }`. Internamente MUST delegar a `diameterToSpan`.

#### Scenario: Llamada existente a diameterToX
- **WHEN** un layer llama `diameterToX(config, 7)`
- **THEN** retorna `{ x1: span.a, x2: span.b }` — mismo resultado que antes en modo vertical

### Requirement: Migración de layers a funciones abstractas
Los 12 layers existentes SHALL ser migrados a usar `depthToPos` y `diameterToSpan` en lugar de `depthToY` y `diameterToX` directamente. El resultado visual en modo vertical MUST ser idéntico al actual.

#### Scenario: Layer migrado en modo vertical
- **WHEN** un layer usa `depthToPos` y `diameterToSpan` en orientación vertical
- **THEN** el renderizado SVG es pixel-identical al resultado con `depthToY` y `diameterToX`
