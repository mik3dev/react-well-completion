## Context

El proyecto tiene un diagrama de completación detallado (`WellDiagram.tsx`) con ~11 layers SVG, tooltips, patterns, colores, y soporte para orientación horizontal + half-section. Se necesita un segundo diagrama mucho más simple para contextos de reportes.

La arquitectura actual usa `useDiagramConfig` para generar coordenadas (`depthToPos`, `diameterToSpan`, `pulgada`). El diagrama simplificado puede reutilizar este hook con parámetros más compactos.

## Goals / Non-Goals

**Goals:**
- Componente SVG independiente y autocontenido
- Escala de grises pura — sin colores
- Solo elementos estructurales: casings, tubing, perforaciones, packers, bomba, eje de profundidad
- Compacto (~150-200px ancho) para usar como panel lateral en reportes
- Reutiliza datos `Well` existentes sin modificaciones

**Non-Goals:**
- No soporta orientación horizontal ni half-section
- No es interactivo (sin tooltips, sin hover)
- No tiene labels inline ni detalle de texto
- No incluye SvgDefs/patterns complejos

## Decisions

### 1. Estructura de componentes separada

**Decisión:** Crear carpeta `src/components/simplified-diagram/` con componentes propios en vez de reutilizar los layers existentes con un "modo simplificado".

**Razón:** Los layers actuales tienen mucha lógica de half-section, tooltips, colores, y patterns que no aplican. Componentes nuevos y simples son más mantenibles que condicionales en cada layer existente.

### 2. Reutilizar `useDiagramConfig`

**Decisión:** Usar el mismo hook `useDiagramConfig` con los datos del pozo. Esto garantiza que las coordenadas (depthToPos, pulgada, centerX) son consistentes.

**Alternativa:** Config propia simplificada. Descartado para mantener consistencia de escala entre ambos diagramas.

### 3. Casings sin hatch pattern

**Decisión:** Dibujar paredes de casing como rectángulos con fill gris sólido (`#ccc`) y stroke `#555`, sin el pattern de líneas diagonales del diagrama principal.

### 4. Perforaciones simplificadas

**Decisión:** Líneas horizontales cortas a ambos lados del casing más interno, color negro, sin distinción shoot/slot (todo igual).

### 5. Bomba como rectángulo sólido

**Decisión:** Sin iconos específicos por tipo (BM/BCP/BES). Un rectángulo negro sólido en la profundidad de la bomba.

### 6. Integración en App

**Decisión:** Agregar como panel opcional junto al diagrama principal, controlable por un toggle. No reemplaza el diagrama principal.

## Risks / Trade-offs

- **Consistencia de escala**: Al usar `useDiagramConfig` con dimensiones diferentes (ancho ~150px vs ~800px), la escala de diámetros será más comprimida. Las casings se verán proporcionalmente más anchas. Esto es aceptable para un esquemático.
- **Mantenimiento dual**: Cambios en el modelo de datos requieren actualizar ambos diagramas. Mitigación: el simplificado usa un subconjunto pequeño de los datos.
