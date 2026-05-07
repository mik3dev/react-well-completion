## ADDED Requirements

### Requirement: WellDiagram acepta profiles opcionales
`WellDiagram` SHALL aceptar un prop opcional `profiles: Profile[]`. Cuando está ausente o vacío, el render del diagrama SHALL ser bit-idéntico al previo a este change.

#### Scenario: Sin profiles
- **WHEN** el consumidor renderiza `<WellDiagram well={...} />`
- **THEN** el SVG de salida no contiene elementos del panel
- **AND** el ancho/alto del diagrama no se modifica

#### Scenario: Con profiles
- **WHEN** el consumidor renderiza `<WellDiagram well={...} profiles={[p1, p2]} />`
- **THEN** el panel se renderiza con dos tracks
- **AND** el área del diagrama se reduce para acomodar el panel

### Requirement: Tracks paralelos comparten eje de profundidad
Cada track del panel SHALL usar `DiagramConfig.depthToPos` para mapear depth, garantizando alineación pixel-perfect con el eje de profundidad del diagrama.

#### Scenario: Punto a la profundidad d
- **WHEN** un profile tiene un point en `depth = d`
- **THEN** la coordenada primaria del point dentro del track es `depthToPos(d)`
- **AND** coincide con la posición de `d` en el diagrama mecánico

### Requirement: Profile shape mínima
Cada profile SHALL declarar al menos `id`, `name`, `unit`, `data`. `color` y `scale` son opcionales.

#### Scenario: Profile sin color
- **WHEN** `profile.color` es `undefined`
- **THEN** el track usa el color en `DEFAULT_PROFILE_COLORS[index % length]`

#### Scenario: Profile con color
- **WHEN** `profile.color = '#abcdef'`
- **THEN** el track usa exactamente ese color

### Requirement: Escala auto con override
La escala de valor de un track SHALL ser `[dataMin - 5% range, dataMax + 5% range]` por defecto. `profile.scale.min` y `profile.scale.max` cuando están definidos SHALL tomar precedencia.

#### Scenario: scale auto
- **WHEN** profile tiene data `[{value: 100}, {value: 200}]` y `scale` undefined
- **THEN** el eje de valor abarca `[95, 205]`

#### Scenario: scale.min override
- **WHEN** `profile.scale = { min: 0 }` y data `[{value: 100}, {value: 200}]`
- **THEN** el eje de valor parte de 0 y termina en `205` (max sigue auto)

#### Scenario: scale invertido
- **WHEN** `profile.scale = { min: 500, max: 100 }`
- **THEN** el eje se sanitiza a `[100, 500]` (no se invierte la curva)

### Requirement: Orientación del panel sigue al diagrama
Cuando `well.orientation === 'vertical'`, el panel SHALL renderizarse a la derecha del diagrama. Cuando `well.orientation === 'horizontal'`, el panel SHALL renderizarse debajo del diagrama, sobre el eje horizontal de profundidad.

#### Scenario: Vertical
- **WHEN** `well.orientation = 'vertical'` y hay 2 profiles con `profileTrackWidth = 140`
- **THEN** el panel ocupa los últimos 280 px del ancho total
- **AND** el diagrama ocupa los `width - 280 - 50` px restantes

#### Scenario: Horizontal
- **WHEN** `well.orientation = 'horizontal'` y hay 2 profiles con `profileTrackWidth = 140`
- **THEN** los tracks se apilan verticalmente entre el diagrama y el eje de profundidad
- **AND** cada track ocupa todo el ancho disponible

### Requirement: Edge cases en data
El componente SHALL manejar datasets vacíos, single-point, y todos-iguales sin crashear.

#### Scenario: data vacío
- **WHEN** `profile.data = []`
- **THEN** el track muestra header y axis pero ningún `polyline` ni `circle`

#### Scenario: single point
- **WHEN** `profile.data.length === 1`
- **THEN** el track renderiza un único `<circle>` visible (no polyline)

#### Scenario: todos los valores iguales
- **WHEN** todos los `value` son iguales
- **THEN** la curva es una línea recta al centro del eje de valor

### Requirement: Tooltip al hover
Cada point del profile SHALL mostrar un tooltip al `mouseEnter` con formato `{name}: {value} {unit} @ {depth} ft`.

#### Scenario: Hover sobre point
- **WHEN** el mouse entra a la zona de un point con `name='Presión'`, `value=2450`, `unit='psi'`, `depth=1240`
- **THEN** el tooltip muestra dos líneas: `Presión: 2450 psi` en la primera y `@ 1240 ft` en la segunda
