## Context

El diagrama SVG se compone de ~11 layers apilados dentro de un `<g transform="translate(45,0)">`. Cada layer recibe `well: Well` y `config: DiagramConfig`. La visibilidad de etiquetas se controla via `useLabelsStore` con categorías definidas en `LABEL_CATEGORIES`. El modelo `Well` actualmente solo tiene `name`, `totalDepth`, `totalFreeDepth` y `liftMethod` como metadatos — no tiene coordenadas, estación ni elevación.

## Goals / Non-Goals

**Goals:**
- Mostrar metadatos del pozo en un title-block SVG profesional dentro del diagrama
- Que la leyenda se exporte correctamente con PNG/SVG/clipboard
- Campos editables desde el sidebar
- Toggle de visibilidad integrado al sistema existente de etiquetas

**Non-Goals:**
- Posición drag-and-drop de la leyenda
- Estilos/temas configurables para el title-block
- Campos de metadatos adicionales (operadora, campo, fecha)

## Decisions

### 1. Leyenda como SVG layer (no HTML overlay)
**Decisión:** Renderizar dentro del SVG como un `<g>` element.
**Razón:** Garantiza que se incluya en exportaciones PNG/SVG sin lógica adicional. Un overlay HTML requeriría capturarlo por separado en `html-to-image`.
**Alternativa descartada:** `position: absolute` div sobre el SVG — no se exporta.

### 2. Campos opcionales en Well interface
**Decisión:** Todos los campos nuevos son `?` (optional).
**Razón:** Wells existentes en localStorage y JSON importados siguen funcionando sin migración. La leyenda muestra "—" para valores ausentes.

### 3. Posición fija top-right
**Decisión:** `x = config.width - boxW - 10`, `y = 10`, dentro del grupo con offset de 45px.
**Razón:** Zona con menos contenido del diagrama (el equipo se centra en centerX). Coincide con la convención de title-blocks en planos de ingeniería (esquina superior o inferior derecha).

### 4. Reusar labels store para toggle
**Decisión:** Agregar categoría `wellDetail` a `LabelCategory` y `LABEL_CATEGORIES`.
**Razón:** Se integra automáticamente al dropdown "Etiquetas" del Toolbar sin modificar Toolbar.tsx.

### 5. Dimensiones fijas en px (no escaladas por config)
**Decisión:** Box width ~220px, row height ~18px, independiente de `pulgada`/`pxPerFt`.
**Razón:** El texto debe ser legible a cualquier escala de profundidad/diámetro.

## Risks / Trade-offs

- **Overlap con labels de perforaciones** → Mitigación: la leyenda ocupa solo los primeros ~160px verticales; los labels de equipo comienzan más abajo. Toggle permite ocultar si interfiere.
- **Ventana muy angosta** → Mitigación: guard `if (config.width < 300) return null`.
- **localStorage con wells sin campos nuevos** → Mitigación: campos opcionales, display "—" para undefined.
