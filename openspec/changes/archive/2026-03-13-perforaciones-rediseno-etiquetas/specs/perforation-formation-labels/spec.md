## ADDED Requirements

### Requirement: Labels de yacimiento y arena se renderizan en LabelsLayer
El sistema SHALL renderizar etiquetas jerárquicas en el lado izquierdo del diagrama cuando existan perforaciones con `yacimiento` o `arena` asignados, controladas por la categoría `yacimientos` en `useLabelsStore`.

#### Scenario: Agrupación por yacimiento
- **WHEN** múltiples perforaciones tienen el mismo valor de `yacimiento`
- **THEN** SHALL dibujarse un corchete `{` vertical izquierdo que abarca desde el `yTop` mínimo hasta el `yBase` máximo del grupo, con el nombre del yacimiento a la izquierda del corchete

#### Scenario: Sub-agrupación por arena
- **WHEN** dentro de un yacimiento hay perforaciones con el mismo valor de `arena`
- **THEN** SHALL dibujarse un corchete `{` interno más pequeño agrupando esas perforaciones, con el nombre de la arena

#### Scenario: Lista de intervalos con espesor
- **WHEN** se muestran las etiquetas de yacimiento
- **THEN** cada perforation SHALL listarse como `{top}' - {base}' ({espesor}')` donde `espesor = base - top`

#### Scenario: Sin etiqueta cuando yacimiento no está definido
- **WHEN** una perforation no tiene `yacimiento` asignado
- **THEN** NOT SHALL renderizarse ningún corchete ni texto de yacimiento para esa perforation

#### Scenario: Visibilidad controlada por toggle
- **WHEN** la categoría `yacimientos` en `useLabelsStore` está en `false`
- **THEN** NOT SHALL renderizarse ninguna etiqueta de yacimiento ni arena en el diagrama

### Requirement: Nueva categoría yacimientos en useLabelsStore
El store `useLabelsStore` SHALL incluir una categoría `yacimientos` con valor default `false`.

#### Scenario: Default oculto
- **WHEN** se inicializa el store por primera vez (sin datos en localStorage)
- **THEN** `visible.yacimientos` SHALL ser `false`

#### Scenario: Toggle funcional
- **WHEN** se llama `toggle('yacimientos')`
- **THEN** `visible.yacimientos` SHALL alternar entre `true` y `false`
