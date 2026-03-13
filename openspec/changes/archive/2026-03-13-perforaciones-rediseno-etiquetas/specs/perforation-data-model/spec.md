## ADDED Requirements

### Requirement: Perforation type includes optional yacimiento and arena fields
El tipo `Perforation` SHALL incluir dos nuevos campos opcionales que permiten asociar un intervalo perforado a su yacimiento y arena productora.

#### Scenario: Campos opcionales sin breaking change
- **WHEN** se carga un `Well` existente desde localStorage que no tiene `yacimiento` ni `arena` en sus perforaciones
- **THEN** el sistema SHALL renderizar el diagrama normalmente sin errores, tratando ambos campos como `undefined`

#### Scenario: Crear perforation con yacimiento y arena
- **WHEN** se llama `createPerforation({ top, base, type, yacimiento: 'B-Inf', arena: 'B-6.2' })`
- **THEN** el objeto resultante SHALL incluir `yacimiento: 'B-Inf'` y `arena: 'B-6.2'` junto con el `id` generado

### Requirement: Editor UI permite ingresar yacimiento y arena
El formulario de edición de perforaciones SHALL incluir campos de texto opcionales para `yacimiento` y `arena`.

#### Scenario: Campos visibles en el formulario
- **WHEN** el usuario abre el editor de una perforation existente
- **THEN** SHALL mostrarse dos inputs de texto etiquetados "Yacimiento" y "Arena" con sus valores actuales (o vacíos si no están definidos)

#### Scenario: Guardar perforation con nuevos campos
- **WHEN** el usuario ingresa valores en los campos Yacimiento/Arena y guarda
- **THEN** el store SHALL actualizar la perforation con los nuevos valores de `yacimiento` y `arena`
