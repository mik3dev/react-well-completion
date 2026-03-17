## ADDED Requirements

### Requirement: Casings renderizan una sola pared en half-section
CasingLayer SHALL renderizar solo la pared del lado visible cuando `halfSection === true`. El shoe se dibuja como media V. El hanger (si aplica) se renderiza solo del lado visible.

#### Scenario: Half-section derecha
- **WHEN** `halfSection === true` y `halfSide === 'right'`
- **THEN** solo se dibuja la pared derecha del casing (de `centerLine` a `x2`), shoe como media V derecha

#### Scenario: Half-section izquierda
- **WHEN** `halfSection === true` y `halfSide === 'left'`
- **THEN** solo se dibuja la pared izquierda del casing (de `x1` a `centerLine`), shoe como media V izquierda

### Requirement: Tubing renderiza una sola línea en half-section
TubingLayer SHALL renderizar solo la línea de pared del lado visible cuando `halfSection === true`.

#### Scenario: Half-section derecha tubing
- **WHEN** `halfSection === true` y `halfSide === 'right'`
- **THEN** solo se dibuja la línea derecha del tubing y los conectores del lado derecho

### Requirement: Rods renderizan medio rectángulo en half-section
RodLayer SHALL renderizar el rod desde `centerLine` hacia el lado visible cuando `halfSection === true`.

#### Scenario: Half-section rods
- **WHEN** `halfSection === true`
- **THEN** el rectángulo del rod va desde `centerLine` hasta el borde del rod del lado visible

### Requirement: Pump renderiza media bomba en half-section
PumpLayer SHALL renderizar el icono de bomba desde `centerLine` hacia el lado visible cuando `halfSection === true`.

#### Scenario: Half-section pump
- **WHEN** `halfSection === true`
- **THEN** el icono de bomba se posiciona desde `centerLine` con ancho = mitad del ancho original

### Requirement: Perforaciones solo del lado visible
PerforationLayer SHALL renderizar perforaciones solo hacia el lado visible cuando `halfSection === true`.

#### Scenario: Half-section perforaciones derecha
- **WHEN** `halfSection === true` y `halfSide === 'right'`
- **THEN** las perforaciones se dibujan solo hacia la derecha del casing

### Requirement: Accessories solo del lado visible
AccessoriesLayer SHALL renderizar packers, nipples, sleeves, packings y mandrels solo del lado visible cuando `halfSection === true`.

#### Scenario: Half-section accessories
- **WHEN** `halfSection === true`
- **THEN** iconos de accessories se renderizan solo del lado indicado por `halfSide`

### Requirement: Earth y Sand llenan solo media sección
EarthLayer y SandLayer SHALL llenar solo desde `centerLine` hacia el lado visible cuando `halfSection === true`.

#### Scenario: Half-section earth/sand
- **WHEN** `halfSection === true` y `halfSide === 'right'`
- **THEN** los rects de earth/sand van desde `centerLine` hasta `x2`

### Requirement: Línea de eje central en half-section
El diagrama SHALL mostrar una línea punteada vertical en `centerLine` cuando `halfSection === true`, indicando el eje de corte.

#### Scenario: Línea de eje visible
- **WHEN** `halfSection === true`
- **THEN** se dibuja una línea dashed desde y=0 hasta y=height en `x = centerLine`

### Requirement: Labels ajustados a media sección
LabelsLayer SHALL posicionar labels en el lado visible cuando `halfSection === true`.

#### Scenario: Labels en half-section derecha
- **WHEN** `halfSection === true` y `halfSide === 'right'`
- **THEN** labels de casings, tubing, perforaciones se posicionan a la derecha del diagrama
