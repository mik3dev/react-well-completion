## ADDED Requirements

### Requirement: Tabla de detalle de casing en el diagrama SVG
El sistema SHALL renderizar un title-block "DETALLE DE CASING" en el diagrama SVG con una tabla que muestre los datos técnicos de cada casing del pozo.

#### Scenario: Pozo con múltiples casings
- **WHEN** el pozo tiene 1 o más casings
- **THEN** el bloque muestra una fila por cada casing, ordenados por diámetro descendente, con columnas: Ø (diámetro fraccional, ej: 9-5/8"), Peso (lb/ft), Grado, Tope (ft), Base (ft), Tipo (Casing o Liner)

#### Scenario: Pozo sin casings
- **WHEN** el pozo tiene 0 casings
- **THEN** el bloque "DETALLE DE CASING" no se renderiza

#### Scenario: Campos opcionales vacíos
- **WHEN** un casing no tiene peso o grado definido
- **THEN** la celda correspondiente muestra "—"

### Requirement: Estilo visual consistente con Detalle de Pozo
El bloque DETALLE DE CASING SHALL usar el mismo estilo visual que el bloque DETALLE DE POZO existente: header oscuro (#2c3e50), acento rojo, filas zebra, sombra, borde redondeado.

#### Scenario: Apariencia visual
- **WHEN** el bloque se renderiza
- **THEN** tiene header con texto blanco "DETALLE DE CASING", filas alternas con fondo #f8f9fa, separadores sutiles entre filas, y sub-header de columnas

### Requirement: Toggle de visibilidad independiente
El bloque SHALL tener un toggle de visibilidad `casingDetail` en el labels store, independiente de los otros bloques.

#### Scenario: Toggle off
- **WHEN** `visible.casingDetail` es false
- **THEN** el bloque no se renderiza y los bloques inferiores suben para llenar el espacio

#### Scenario: Toggle on por defecto
- **WHEN** se carga el diagrama por primera vez
- **THEN** `casingDetail` está habilitado (true)
