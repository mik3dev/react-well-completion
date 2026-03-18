## MODIFIED Requirements

### Requirement: Apilamiento vertical de bloques de detalle
El bloque DETALLE DE POZO SHALL soportar apilamiento dinámico con los nuevos bloques (DETALLE DE CASING y DETALLE DE TUBERÍAS). El orden es fijo: Pozo → Casing → Tuberías. Si un bloque está oculto, los inferiores suben automáticamente.

#### Scenario: Todos los bloques visibles
- **WHEN** los toggles wellDetail, casingDetail y tubingDetail están habilitados
- **THEN** los tres bloques se apilan verticalmente en la esquina superior derecha con un gap de 8px entre ellos

#### Scenario: Bloque intermedio oculto
- **WHEN** wellDetail está oculto pero casingDetail y tubingDetail están visibles
- **THEN** casingDetail se posiciona en y=10 (posición original del pozo) y tubingDetail debajo

### Requirement: Ancho unificado de bloques de detalle
Todos los bloques de detalle SHALL usar el mismo ancho (280px) para consistencia visual.

#### Scenario: Ancho del bloque de pozo
- **WHEN** el bloque DETALLE DE POZO se renderiza
- **THEN** usa 280px de ancho (ampliado desde 220px)
