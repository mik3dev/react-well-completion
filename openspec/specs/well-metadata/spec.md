## ADDED Requirements

### Requirement: Campos de metadatos en el modelo Well
El sistema SHALL soportar los siguientes campos opcionales en la interfaz `Well`: `latitude` (number), `longitude` (number), `estacionFlujo` (string), `mesaRotaria` (number). Todos MUST ser opcionales para compatibilidad con datos existentes.

#### Scenario: Well existente sin campos nuevos
- **WHEN** se carga un Well desde localStorage o JSON que no tiene los campos nuevos
- **THEN** el sistema funciona normalmente con los campos como `undefined`

#### Scenario: Crear nuevo Well
- **WHEN** se crea un Well nuevo con `createWell()`
- **THEN** los campos de metadatos están como `undefined` por defecto

### Requirement: Edición de metadatos en sidebar
El sistema SHALL proveer inputs en la sección "Información General" del editor para editar: latitud, longitud, estación de flujo, y mesa rotaria.

#### Scenario: Editar coordenadas
- **WHEN** el usuario ingresa un valor numérico en el campo "Latitud"
- **THEN** el campo `latitude` del Well se actualiza y la leyenda refleja el cambio

#### Scenario: Limpiar campo opcional
- **WHEN** el usuario borra el contenido de un campo numérico opcional
- **THEN** el campo se establece como `undefined` y la leyenda muestra "—"

### Requirement: Datos de ejemplo con metadatos
Los pozos de ejemplo SHALL incluir valores realistas para los campos de metadatos.

#### Scenario: Cargar ejemplo BM
- **WHEN** se carga el pozo de ejemplo "Ejemplo BM"
- **THEN** tiene coordenadas, estación de flujo y mesa rotaria con valores de ejemplo
