## ADDED Requirements

### Requirement: Tabla de detalle de tuberías en el diagrama SVG
El sistema SHALL renderizar un title-block "DETALLE DE TUBERÍAS" en el diagrama SVG con una tabla que muestre los datos técnicos de cada segmento de tubing.

#### Scenario: Pozo con segmentos de tubing
- **WHEN** el pozo tiene 1 o más segmentos de tubing
- **THEN** el bloque muestra una fila por segmento ordenados por número de segmento, con columnas: Seg. (número), Ø (diámetro en pulgadas), Long. (longitud en ft), Prof. Acum. (profundidad acumulada calculada como suma de longitudes anteriores)

#### Scenario: Pozo con bomba
- **WHEN** el pozo tiene una bomba (pump !== null)
- **THEN** se agrega una fila adicional al final de la tabla con: tipo de bomba, profundidad, diámetro

#### Scenario: Pozo sin tubing
- **WHEN** el pozo tiene 0 segmentos de tubing
- **THEN** el bloque "DETALLE DE TUBERÍAS" no se renderiza

### Requirement: Estilo visual consistente
El bloque SHALL usar el mismo estilo visual que los otros bloques de detalle: header oscuro, acento rojo, filas zebra, sombra, borde redondeado.

#### Scenario: Apariencia visual
- **WHEN** el bloque se renderiza
- **THEN** tiene header "DETALLE DE TUBERÍAS" y sub-header de columnas con el mismo estilo

### Requirement: Toggle de visibilidad independiente
El bloque SHALL tener un toggle `tubingDetail` en el labels store.

#### Scenario: Toggle off
- **WHEN** `visible.tubingDetail` es false
- **THEN** el bloque no se renderiza y los bloques inferiores suben

#### Scenario: Toggle on por defecto
- **WHEN** se carga el diagrama por primera vez
- **THEN** `tubingDetail` está habilitado (true)
