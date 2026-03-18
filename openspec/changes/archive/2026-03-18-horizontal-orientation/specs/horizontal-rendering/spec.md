## ADDED Requirements

### Requirement: Casings renderizan horizontalmente
CasingLayer SHALL renderizar paredes como rectángulos horizontales (ancho = depth range, alto = WALL) cuando `orientation === 'horizontal'`. Shoes apuntan hacia la derecha. Hangers en el lado izquierdo (tope).

#### Scenario: Casing horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** la pared del casing es un rectángulo horizontal: x=depthToPos(top), y=span.a, width=depthRange, height=WALL

#### Scenario: Shoe horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** el shoe apunta hacia la derecha (hacia el fondo del pozo)

### Requirement: Tubing renderiza horizontalmente
TubingLayer SHALL renderizar segmentos como líneas horizontales cuando `orientation === 'horizontal'`.

#### Scenario: Tubing horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** cada segmento se dibuja como dos líneas horizontales (superior e inferior) con conectores verticales en cambios de diámetro

### Requirement: Rods renderizan horizontalmente
RodLayer SHALL renderizar rods como rectángulos horizontales centrados en `centerLine` cuando `orientation === 'horizontal'`.

#### Scenario: Rods horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** los rods son rectángulos: x=depthToPos(top), y=centerLine-rodW/2, width=depthRange, height=rodW

### Requirement: Pump renderiza horizontalmente
PumpLayer SHALL renderizar iconos de bomba orientados horizontalmente cuando `orientation === 'horizontal'`.

#### Scenario: Pump horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** el icono de bomba se posiciona en x=depthToPos(depth) con ancho=pumpHeight y alto=pumpWidth

### Requirement: Perforaciones renderizan horizontalmente
PerforationLayer SHALL renderizar líneas de perforación como líneas verticales (perpendiculares al eje de profundidad) cuando `orientation === 'horizontal'`.

#### Scenario: Perforaciones horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** las líneas de shoot/slot son verticales, extendiéndose arriba/abajo del casing

### Requirement: Earth y Sand renderizan horizontalmente
EarthLayer y SandLayer SHALL llenar áreas horizontalmente cuando `orientation === 'horizontal'`.

#### Scenario: Sand horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** los rects de arena se posicionan: x=depthToPos(top), y=0, width=depthRange, height=span.a (arriba) y y=span.b (abajo)

### Requirement: DepthAxis renderiza horizontalmente
DepthAxisLayer SHALL renderizar el eje de profundidad como eje horizontal (arriba del diagrama) con ticks verticales y labels horizontales cuando `orientation === 'horizontal'`.

#### Scenario: DepthAxis horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** los ticks son líneas verticales, los labels están arriba, las grid lines son verticales

### Requirement: Labels legibles en horizontal
LabelsLayer SHALL posicionar labels arriba o abajo del diagrama con texto horizontal (no rotado) cuando `orientation === 'horizontal'`.

#### Scenario: Labels horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** los labels son texto horizontal posicionado fuera del casing exterior (arriba o abajo)

### Requirement: SVG container adapta layout para horizontal
WellDiagram SHALL ajustar el transform del grupo SVG y los margins para acomodar el eje de profundidad horizontal.

#### Scenario: Layout horizontal
- **WHEN** `orientation === 'horizontal'`
- **THEN** el grupo SVG usa `translate(0, 30)` para dar espacio al eje de profundidad arriba

### Requirement: Horizontal compatible con half-section
Todos los layers SHALL funcionar correctamente con `orientation === 'horizontal'` combinado con `halfSection === true`.

#### Scenario: Horizontal + half-section
- **WHEN** `orientation === 'horizontal'` y `halfSection === true`
- **THEN** se renderiza solo la mitad superior o inferior del pozo horizontal
