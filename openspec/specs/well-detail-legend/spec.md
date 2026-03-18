## ADDED Requirements

### Requirement: SVG title-block con metadatos del pozo
El sistema SHALL renderizar un bloque "DETALLE DE POZO" como layer SVG en la esquina superior derecha del diagrama, mostrando: nombre del pozo, método de levantamiento, coordenadas (lat/lon), estación de flujo (EF), mesa rotaria (MR) en pies, profundidad total (PT) en pies, y profundidad máxima libre (HUD) en pies.

#### Scenario: Pozo con todos los metadatos
- **WHEN** el pozo tiene todos los campos de metadatos definidos
- **THEN** la leyenda muestra cada fila con su valor formateado (coordenadas con 4 decimales, profundidades con sufijo `'`, mesa rotaria con sufijo `ft`)

#### Scenario: Pozo con metadatos parciales
- **WHEN** el pozo no tiene algunos campos opcionales (latitude, longitude, estacionFlujo, mesaRotaria)
- **THEN** la leyenda muestra "—" en las filas correspondientes

#### Scenario: Ventana angosta
- **WHEN** el ancho disponible del diagrama es menor a 300px
- **THEN** la leyenda no se renderiza

### Requirement: Toggle de visibilidad de la leyenda
El sistema SHALL permitir ocultar/mostrar la leyenda desde el dropdown "Etiquetas" usando la categoría "Detalle de Pozo".

#### Scenario: Toggle desde Etiquetas
- **WHEN** el usuario desmarca "Detalle de Pozo" en el dropdown de Etiquetas
- **THEN** la leyenda desaparece del diagrama

### Requirement: Exportación incluye leyenda
El sistema SHALL incluir la leyenda en las exportaciones PNG, SVG y clipboard cuando está visible.

#### Scenario: Exportar PNG con leyenda visible
- **WHEN** la leyenda está visible y el usuario exporta PNG
- **THEN** el archivo PNG incluye el title-block con todos los metadatos

### Requirement: Estilo profesional de ingeniería
El sistema SHALL renderizar la leyenda con header oscuro (#2c3e50), texto blanco en el título, filas con separadores sutiles, y tipografía sans-serif legible.

#### Scenario: Apariencia visual
- **WHEN** la leyenda se renderiza
- **THEN** tiene un header con fondo oscuro, texto "DETALLE DE POZO" centrado en blanco, y filas alternando label (gris) y valor (negro) con líneas divisorias sutiles

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
