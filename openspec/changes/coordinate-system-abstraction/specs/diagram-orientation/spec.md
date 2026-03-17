## ADDED Requirements

### Requirement: Campos de orientación en el modelo Well
El `Well` interface SHALL incluir campos opcionales: `orientation?: 'vertical' | 'horizontal'` (default `'vertical'`), `halfSection?: boolean` (default `false`), `halfSide?: 'right' | 'left'` (default `'right'`).

#### Scenario: Well existente sin campos de orientación
- **WHEN** se carga un Well desde localStorage o JSON sin campos de orientación
- **THEN** el sistema usa defaults: vertical, sección completa

#### Scenario: Well con orientación horizontal
- **WHEN** un Well tiene `orientation: 'horizontal'`
- **THEN** `DiagramConfig` se genera con mapeo horizontal

### Requirement: Controles de orientación en el editor
El editor SHALL proveer controles en la sección "Información General" para seleccionar orientación (vertical/horizontal) y activar media sección con selector de lado.

#### Scenario: Cambiar orientación a horizontal
- **WHEN** el usuario selecciona "Horizontal" en el selector de orientación
- **THEN** el campo `orientation` del Well se actualiza a `'horizontal'`

#### Scenario: Activar media sección
- **WHEN** el usuario activa el toggle de media sección
- **THEN** `halfSection` se establece en `true` y aparece selector de lado (derecha/izquierda)

#### Scenario: Desactivar media sección
- **WHEN** el usuario desactiva el toggle de media sección
- **THEN** `halfSection` se establece en `false` y el selector de lado se oculta

### Requirement: Store soporta campos de orientación
`updateWellMeta` SHALL aceptar los campos `orientation`, `halfSection`, `halfSide` para actualizar la configuración de visualización del pozo.

#### Scenario: Actualizar orientación via store
- **WHEN** se llama `updateWellMeta(id, { orientation: 'horizontal' })`
- **THEN** el Well se actualiza y el diagrama re-renderiza con la nueva orientación
