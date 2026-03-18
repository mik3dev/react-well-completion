## ADDED Requirements

### Requirement: Componente SimplifiedDiagram renderiza diagrama esquemático
El sistema SHALL renderizar un diagrama SVG simplificado del pozo usando los datos `Well` existentes, en escala de grises, mostrando solo elementos estructurales esenciales.

#### Scenario: Pozo con todos los elementos
- **WHEN** se renderiza un pozo con casings, tubing, perforaciones, packers y bomba
- **THEN** el diagrama muestra todos estos elementos en escala de grises sin arenas, earth, labels, tooltips, ni accesorios menores

#### Scenario: Pozo con solo casings y tubing
- **WHEN** el pozo no tiene perforaciones, packers ni bomba
- **THEN** el diagrama muestra solo casings y tubing con eje de profundidad

### Requirement: Casings como paredes grises simples
Los casings SHALL renderizarse como rectángulos con fill gris claro y stroke gris oscuro, con zapatas simplificadas en la base.

#### Scenario: Múltiples casings anidados
- **WHEN** el pozo tiene casings de diferentes diámetros
- **THEN** se renderizan anidados con paredes grises, ordenados por diámetro descendente, con conectores horizontales entre cambios de diámetro

### Requirement: Tubing como líneas grises
El tubing SHALL renderizarse como líneas verticales grises simples (sin paredes dobles detalladas).

#### Scenario: Múltiples segmentos de tubing
- **WHEN** el tubing tiene múltiples segmentos con diferentes diámetros
- **THEN** se renderizan como líneas continuas con conectores en los cambios de diámetro

### Requirement: Perforaciones como líneas horizontales
Las perforaciones SHALL renderizarse como líneas horizontales cortas negras a ambos lados del casing más interno, sin distinción entre shoot y slot.

#### Scenario: Perforaciones presentes
- **WHEN** el pozo tiene perforaciones
- **THEN** se renderizan líneas horizontales negras en el intervalo correspondiente

### Requirement: Empacaduras visibles
Las empacaduras (packers) SHALL renderizarse como rectángulos grises oscuros con pattern diagonal a ambos lados del tubing.

#### Scenario: Packers presentes
- **WHEN** el pozo tiene packers
- **THEN** se renderizan en la profundidad correspondiente entre el tubing y el casing

### Requirement: Bomba como rectángulo sólido
La bomba SHALL renderizarse como un rectángulo negro sólido en la profundidad de asentamiento, sin iconos específicos por tipo.

#### Scenario: Bomba presente
- **WHEN** el pozo tiene bomba
- **THEN** se renderiza un rectángulo negro en la profundidad de la bomba

#### Scenario: Sin bomba
- **WHEN** el pozo no tiene bomba
- **THEN** no se renderiza nada en esa posición

### Requirement: Eje de profundidad
El diagrama SHALL incluir un eje de profundidad con ticks y labels numéricos en gris.

#### Scenario: Eje de profundidad
- **WHEN** el diagrama se renderiza
- **THEN** muestra un eje vertical con ticks y valores de profundidad en pies

### Requirement: Escala de grises exclusiva
El diagrama completo SHALL usar exclusivamente escala de grises (negro, grises, blanco). No SHALL usar colores.

#### Scenario: Paleta de colores
- **WHEN** cualquier elemento se renderiza
- **THEN** usa solo valores de gris (#000 a #fff), sin colores cromáticos

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

### Requirement: Componente independiente y reutilizable
El `SimplifiedDiagram` SHALL ser un componente independiente que recibe `Well` como prop y se auto-contiene (no depende de TooltipProvider, SvgDefs, ni stores de labels).

#### Scenario: Uso independiente
- **WHEN** el componente se monta en cualquier contexto
- **THEN** renderiza el diagrama sin dependencias externas más allá de los datos `Well`
