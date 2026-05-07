## MODIFIED Requirements

### Requirement: Orientación del panel sigue al diagrama
Cuando `well.orientation === 'vertical'`, el panel SHALL renderizarse a la derecha del diagrama por defecto. Cuando además `well.halfSection === true` y hay profiles, el panel SHALL ocupar la mitad liberada por la half-section, posicionándose en el lado opuesto a `halfSide`. En orientación horizontal, el panel SHALL renderizarse debajo del diagrama (sin importar `halfSection`).

#### Scenario: Vertical estándar
- **WHEN** `well.orientation = 'vertical'`, `halfSection` ausente o false, hay 2 profiles con `profileTrackWidth = 140`
- **THEN** el panel ocupa los últimos 280 px del ancho total
- **AND** el diagrama ocupa los `width - 280 - 50` px restantes

#### Scenario: Vertical + half-section, halfSide='right'
- **WHEN** `well.orientation = 'vertical'`, `halfSection = true`, `halfSide = 'right'`, hay 2 profiles
- **THEN** el panel se posiciona a la izquierda (justo después del eje de profundidad)
- **AND** el diagrama mantiene su ancho conceptual completo y dibuja solo la mitad derecha
- **AND** cada track crece para llenar la mitad liberada (`effectiveTrackWidth = max(profileTrackWidth, halfAvailable / N)`)

#### Scenario: Vertical + half-section, halfSide='left'
- **WHEN** `well.orientation = 'vertical'`, `halfSection = true`, `halfSide = 'left'`, hay 2 profiles
- **THEN** el panel se posiciona a la derecha (después del centerLine)
- **AND** el diagrama dibuja solo la mitad izquierda
- **AND** cada track crece para llenar la mitad liberada

#### Scenario: Horizontal
- **WHEN** `well.orientation = 'horizontal'` y hay 2 profiles con `profileTrackWidth = 140`
- **THEN** los tracks se apilan verticalmente entre el diagrama y el eje de profundidad
- **AND** cada track ocupa todo el ancho disponible
- **AND** `halfSection` no afecta esta lógica (out of scope para v1 de este feature)

## ADDED Requirements

### Requirement: profileTrackWidth se vuelve un mínimo en half-section fill mode
En el modo `vertical + half-section + profiles`, `profileTrackWidth` SHALL interpretarse como un valor mínimo. Cada track SHALL tener ancho `max(profileTrackWidth, halfAvailable / N)`. Si el mínimo configurado por el consumidor es mayor que el slot ideal, el panel resultante SHALL exceder el espacio liberado y solapar visualmente con el diagrama (tradeoff aceptado para preservar el mínimo del consumidor).

#### Scenario: Mínimo no excede slot ideal
- **WHEN** `profileTrackWidth = 140`, `size.width = 800`, 2 profiles, halfSection activo
- **THEN** `halfAvailable = (800 - 50) / 2 = 375`
- **AND** `effectiveTrackWidth = max(140, 375 / 2) = 187.5`
- **AND** ancho total del panel = `2 × 187.5 = 375` (cabe en la mitad libre)

#### Scenario: Mínimo excede slot ideal
- **WHEN** `profileTrackWidth = 300`, `size.width = 800`, 2 profiles, halfSection activo
- **THEN** `halfAvailable = 375`
- **AND** `effectiveTrackWidth = max(300, 187.5) = 300`
- **AND** ancho total del panel = `600` > `375` → el panel rebasa la mitad liberada y solapa visualmente con el diagrama
