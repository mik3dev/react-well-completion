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
