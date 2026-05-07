## MODIFIED Requirements

### Requirement: Orientación del panel sigue al diagrama
Cuando `well.orientation === 'vertical'`, el panel SHALL renderizarse a la derecha del diagrama por defecto. Cuando `well.orientation === 'horizontal'`, el panel SHALL renderizarse debajo del diagrama por defecto.

Cuando además `well.halfSection === true` y hay profiles (en cualquier orientación), el panel SHALL ocupar la mitad liberada por la half-section, posicionándose en el lado opuesto a la mitad donde el diagrama se dibuja.

#### Scenario: Vertical estándar
- **WHEN** `well.orientation = 'vertical'`, `halfSection` ausente o false, hay 2 profiles con `profileTrackWidth = 140`
- **THEN** el panel ocupa los últimos 280 px del ancho total
- **AND** el diagrama ocupa los `width - 280 - 50` px restantes

#### Scenario: Vertical + half-section, halfSide='right'
- **WHEN** `well.orientation = 'vertical'`, `halfSection = true`, `halfSide = 'right'`, hay 2 profiles
- **THEN** el panel se posiciona a la izquierda (justo después del eje de profundidad)
- **AND** el diagrama mantiene su ancho conceptual completo y dibuja solo la mitad derecha
- **AND** cada track crece para llenar la mitad liberada (`effectiveTrackWidth = max(profileTrackWidth, halfAvailableW / N)`)

#### Scenario: Vertical + half-section, halfSide='left'
- **WHEN** `well.orientation = 'vertical'`, `halfSection = true`, `halfSide = 'left'`, hay 2 profiles
- **THEN** el panel se posiciona a la derecha (después del centerLine)
- **AND** el diagrama dibuja solo la mitad izquierda
- **AND** cada track crece para llenar la mitad liberada

#### Scenario: Horizontal estándar
- **WHEN** `well.orientation = 'horizontal'`, `halfSection` ausente o false, hay 2 profiles con `profileTrackWidth = 140`
- **THEN** los tracks se apilan verticalmente entre el diagrama y el eje de profundidad
- **AND** cada track ocupa todo el ancho disponible

#### Scenario: Horizontal + half-section, halfSide='right'
- **WHEN** `well.orientation = 'horizontal'`, `halfSection = true`, `halfSide = 'right'`, hay 2 profiles
- **THEN** el diagrama dibuja solo la mitad superior (post-rotación)
- **AND** el panel se posiciona en la mitad inferior (`panelOffsetY = 30 + halfAvailableH`)
- **AND** cada track crece en alto para llenar la mitad liberada (`effectiveTrackHeightH = max(profileTrackWidth, halfAvailableH / N)`)

#### Scenario: Horizontal + half-section, halfSide='left'
- **WHEN** `well.orientation = 'horizontal'`, `halfSection = true`, `halfSide = 'left'`, hay 2 profiles
- **THEN** el diagrama dibuja solo la mitad inferior (post-rotación)
- **AND** el panel se posiciona en la mitad superior (`panelOffsetY = 30`)
- **AND** cada track crece en alto para llenar la mitad liberada

## ADDED Requirements

### Requirement: profileTrackWidth se vuelve un mínimo en half-section fill mode
En modo `half-section + profiles` (en cualquiera de las dos orientaciones), `profileTrackWidth` SHALL interpretarse como un valor mínimo. Cada track SHALL tener dimensión secundaria `max(profileTrackWidth, halfAvailable / N)` (ancho en vertical, alto en horizontal). Si el mínimo configurado por el consumidor es mayor que el slot ideal, el panel resultante SHALL exceder el espacio liberado y solapar visualmente con el diagrama (tradeoff aceptado para preservar el mínimo del consumidor).

#### Scenario: Mínimo no excede slot ideal (vertical)
- **WHEN** `profileTrackWidth = 140`, `size.width = 800`, 2 profiles, halfSection activo, vertical
- **THEN** `halfAvailableW = (800 - 50) / 2 = 375`
- **AND** `effectiveTrackWidth = max(140, 375 / 2) = 187.5`
- **AND** ancho total del panel = `2 × 187.5 = 375` (cabe en la mitad libre)

#### Scenario: Mínimo excede slot ideal (vertical)
- **WHEN** `profileTrackWidth = 300`, `size.width = 800`, 2 profiles, halfSection activo, vertical
- **THEN** `halfAvailableW = 375`
- **AND** `effectiveTrackWidth = max(300, 187.5) = 300`
- **AND** ancho total del panel = `600` > `375` → el panel rebasa la mitad liberada y solapa visualmente con el diagrama

#### Scenario: Mínimo no excede slot ideal (horizontal)
- **WHEN** `profileTrackWidth = 140`, `size.height = 800`, 2 profiles, halfSection activo, horizontal
- **THEN** `halfAvailableH = (800 - 100) / 2 = 350`
- **AND** `effectiveTrackHeightH = max(140, 350 / 2) = 175`
- **AND** alto total del panel = `2 × 175 = 350` (cabe en la mitad libre)
