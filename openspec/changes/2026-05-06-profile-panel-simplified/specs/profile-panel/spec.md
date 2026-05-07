## ADDED Requirements

### Requirement: SimplifiedDiagram acepta profiles opcionales
`SimplifiedDiagram` SHALL aceptar el mismo prop opcional `profiles: Profile[]` que `WellDiagram`. Cuando está ausente o vacío, el render del diagrama simplificado SHALL ser bit-idéntico al previo a este change.

#### Scenario: Sin profiles
- **WHEN** el consumidor renderiza `<SimplifiedDiagram well={...} />`
- **THEN** el SVG de salida no contiene elementos del panel
- **AND** el ancho/alto del diagrama no se modifica

#### Scenario: Con profiles
- **WHEN** el consumidor renderiza `<SimplifiedDiagram well={...} profiles={[p1, p2]} />`
- **THEN** el panel se renderiza con dos tracks
- **AND** el área del diagrama se reduce para acomodar el panel

### Requirement: SimplifiedDiagram comparte el mismo eje de profundidad con el panel
Cada track del panel SHALL usar `DiagramConfig.depthToPos` para mapear depth, garantizando alineación pixel-perfect con el eje de profundidad del diagrama simplificado.

#### Scenario: Punto a profundidad d (vertical)
- **WHEN** un profile tiene un point en `depth = d` y la orientación es vertical
- **THEN** la coordenada Y del point dentro del track es `depthToPos(d)`
- **AND** coincide con la posición Y de `d` en el diagrama simplificado

#### Scenario: Punto a profundidad d (horizontal)
- **WHEN** un profile tiene un point en `depth = d` y la orientación es horizontal
- **THEN** la coordenada X del point dentro del track usa la misma fórmula gamma γ=1.5 que el eje horizontal del diagrama simplificado

### Requirement: Orientación del panel sigue al diagrama simplificado
Cuando `well.orientation === 'vertical'`, el panel SHALL renderizarse a la derecha. Cuando `well.orientation === 'horizontal'`, el panel SHALL renderizarse debajo del diagrama. `halfSection` no afecta el layout del panel en `SimplifiedDiagram` (las layers simplified ignoran `halfSection`).

#### Scenario: Vertical
- **WHEN** `well.orientation = 'vertical'` y hay 2 profiles con `profileTrackWidth = 140`
- **THEN** el panel ocupa los últimos 280 px del ancho total
- **AND** el diagrama ocupa los `width - 280 - 40` px restantes

#### Scenario: Horizontal
- **WHEN** `well.orientation = 'horizontal'` y hay 2 profiles con `profileTrackWidth = 140`
- **THEN** los tracks se apilan verticalmente entre el diagrama y el eje de profundidad
- **AND** cada track ocupa todo el ancho disponible

### Requirement: Tooltip al hover en SimplifiedDiagram
`SimplifiedDiagram` SHALL envolver su contenido en `TooltipProvider` y SHALL exhibir el mismo tooltip de hover sobre los puntos del perfil que `WellDiagram`.

#### Scenario: Hover sobre point
- **WHEN** el mouse entra a la zona de un point con `name='Presión'`, `value=2450`, `unit='psi'`, `depth=1240` en un `SimplifiedDiagram`
- **THEN** el tooltip muestra dos líneas: `Presión: 2450 psi` en la primera y `@ 1240 ft` en la segunda
