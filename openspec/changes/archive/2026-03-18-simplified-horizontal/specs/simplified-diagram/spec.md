## MODIFIED Requirements

### Requirement: Soporte de orientación horizontal
El `SimplifiedDiagram` SHALL respetar `well.orientation` y renderizar el diagrama horizontalmente (tope a la izquierda, fondo a la derecha) cuando el valor es `'horizontal'`.

#### Scenario: Orientación vertical (default)
- **WHEN** `well.orientation` es `'vertical'` o undefined
- **THEN** el diagrama se renderiza verticalmente con eje de profundidad a la izquierda

#### Scenario: Orientación horizontal
- **WHEN** `well.orientation` es `'horizontal'`
- **THEN** el diagrama se renderiza horizontalmente via rotación SVG, con eje de profundidad en la parte inferior

#### Scenario: Layers sin cambios
- **WHEN** el diagrama se renderiza en orientación horizontal
- **THEN** los layers internos (casings, tubing, perforaciones, etc.) se renderizan sin modificaciones — la rotación SVG maneja el cambio de eje
