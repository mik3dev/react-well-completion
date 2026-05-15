## MODIFIED Requirements

### Requirement: Rango de profundidad de la EarthLayer
La `EarthLayer` SHALL renderizar la formación entre la profundidad del shoe del casing no-liner más profundo (`max(c.base where !c.isLiner)`) y `totalDepth`. La `EarthLayer` NO SHALL usar `totalFreeDepth` (HUD) para determinar el rango.

Cuando no hay casings non-liner, la `EarthLayer` SHALL no renderizar nada (sin fallback a HUD).

#### Scenario: Pozo con surface + intermedio + liner
- **WHEN** un pozo tiene casings: surface 0-4000, intermedio 0-14650, liner 14132-16372, totalDepth 16377
- **THEN** la `EarthLayer` renderiza entre 14650 (shoe del intermedio) y 16377

#### Scenario: Pozo sin liner
- **WHEN** un pozo tiene solo surface 0-2000 y producción 0-10000, totalDepth 10000
- **THEN** `earthTop = 10000 >= totalDepth` → la `EarthLayer` no renderiza nada

#### Scenario: Pozo solo con liner
- **WHEN** un pozo tiene solo un liner como única casing
- **THEN** `nonLinerCasings.length === 0` → la `EarthLayer` no renderiza nada

#### Scenario: HUD < max(non-liner shoe)
- **WHEN** un pozo tiene HUD = 13000 y `max(non-liner shoe) = 14650`
- **THEN** la `EarthLayer` usa 14650 (no 13000) — HUD es una restricción operacional, no afecta dónde está la formación

## ADDED Requirements

### Requirement: Fill configurable
La `EarthLayer` SHALL aceptar una prop opcional `fill` que controla el atributo SVG `fill` de los rectángulos de formación. El default SHALL ser `'url(#earthFill)'` (la textura definida en `<SvgDefs>`).

#### Scenario: Fill por defecto
- **WHEN** la `EarthLayer` se renderiza sin el prop `fill`
- **THEN** cada rect tiene `fill="url(#earthFill)"`

#### Scenario: Fill custom
- **WHEN** se pasa `fill="#abcdef"`
- **THEN** cada rect tiene `fill="#abcdef"`

### Requirement: BrandTheme expone earthFill
`BrandTheme` SHALL incluir una propiedad `earthFill: string` (default `'url(#earthFill)'`). `WellDiagram` SHALL pasar `mergedTheme.earthFill` a la `EarthLayer`.

#### Scenario: Tema custom
- **WHEN** el consumidor pasa `theme={{ earthFill: 'transparent' }}` a `WellDiagram`
- **THEN** la `EarthLayer` renderiza rects transparentes (no visible)

### Requirement: SimplifiedDiagram acepta earthFill
`SimplifiedDiagramProps` SHALL incluir una prop opcional `earthFill?: string` (default `'transparent'`). `SimplifiedDiagram` SHALL renderizar la `EarthLayer` pasando este valor como `fill`.

#### Scenario: Default transparente
- **WHEN** un consumidor renderiza `<SimplifiedDiagram well={...} />` sin pasar `earthFill`
- **THEN** la `EarthLayer` renderiza rects con `fill="transparent"` (no visible)

#### Scenario: Earth visible en simplified
- **WHEN** el consumidor pasa `earthFill="#f5f5f5"`
- **THEN** la `EarthLayer` renderiza rects con `fill="#f5f5f5"`

### Requirement: parseBackendWell infiere isLiner desde la geometría
`parseBackendWell` SHALL marcar como `isLiner: true` cualquier item del array `Casing[]` cuyo `Tope (pies)` sea mayor que 0. Items con `Tope (pies) === 0` SHALL quedar como `isLiner: false`. Items del array `Liner[]` SHALL siempre quedar como `isLiner: true` independientemente de su `Tope (pies)`.

Esto cubre backends que mezclan liners en el array `Casing[]` (data quality issue común). Es necesario para que la `EarthLayer` funcione correctamente cuando el criterio de profundidad usa `max(non-liner shoes)`.

#### Scenario: Casing desde superficie
- **WHEN** el JSON tiene `Casing: [{ "Tope (pies)": 0, "Base (pies)": 4000 }]`
- **THEN** `well.casings[0].isLiner === false`

#### Scenario: Casing con Tope>0 (inferencia)
- **WHEN** el JSON tiene `Casing: [{ "Tope (pies)": 13873, "Base (pies)": 16178 }]`
- **THEN** `well.casings[0].isLiner === true` (inferido)

#### Scenario: Liner explícito
- **WHEN** el JSON tiene `Liner: [{ "Tope (pies)": 0, "Base (pies)": 16000 }]` (raro, top=0 en Liner)
- **THEN** `well.casings[0].isLiner === true` (explícito sobre inferencia)
