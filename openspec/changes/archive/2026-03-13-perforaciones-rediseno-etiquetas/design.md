## Context

El diagrama mecánico de pozos usa un sistema de coordenadas donde `pulgada = width/40` (px por pulgada de diámetro) y `pxPerFt` (px por pie de profundidad). Las capas SVG se apilan en `WellDiagram.tsx` y cada una recibe un `DiagramConfig`. Actualmente `PerforationLayer` usa flechas con `markerEnd` que no se alinean con la simbología estándar de la industria petrolera. El modelo `Perforation` solo tiene `id`, `top`, `base` y `type`.

## Goals / Non-Goals

**Goals:**
- Representar perforaciones como líneas horizontales densas que cruzan la pared del casing (estándar de la industria)
- Permitir asociar cada perforation a un `yacimiento` y `arena` opcionales
- Renderizar etiquetas jerárquicas (yacimiento → arena → intervalos) en el lado izquierdo del diagrama
- Mantener compatibilidad con datos existentes (campos opcionales, no breaking)

**Non-Goals:**
- No se cambia el tipo `slot` — mantiene su representación actual
- No se implementa agrupación automática de perforaciones adyacentes
- No se soporta edición gráfica inline de etiquetas de yacimiento

## Decisions

### D1: Campos `yacimiento` y `arena` como strings opcionales en `Perforation`

Se añaden directamente al tipo `Perforation` en lugar de crear una entidad separada `Formation`. Alternativa considerada: tabla separada de yacimientos con FK. Rechazada porque añade complejidad innecesaria para la cantidad de datos manejada y la relación es informativa, no referencial.

### D2: Etiquetas renderizadas en `LabelsLayer`, no en `PerforationLayer`

Las etiquetas de yacimiento/arena van en `LabelsLayer` para mantener la separación de responsabilidades (cada layer renderiza geometría, LabelsLayer renderiza todas las anotaciones de texto). Las etiquetas quedan bajo el toggle `yacimientos` de `useLabelsStore`. Alternativa: renderizarlas directamente en `PerforationLayer`. Rechazada porque mezclaría lógica de anotación con lógica de geometría.

### D3: Agrupación de etiquetas por yacimiento → arena en el render

En `LabelsLayer`, las perforaciones se agrupan por `yacimiento` primero y por `arena` después (usando `reduce`). Para cada grupo se calcula el `yTop` mínimo y `yBase` máximo para dibujar el corchete `{` vertical. Cada perforation individual muestra su rango e intervalo calculado `(base - top)'`.

### D4: Visual de shoot — líneas horizontales densas

Las líneas de perforation cruzarán la pared del casing: desde `x1 - outerLen` hasta `x1 + innerOverlap` en el lado izquierdo, y desde `x2 - innerOverlap` hasta `x2 + outerLen` en el derecho. El espaciado mínimo se basa en `pulgada * 0.5` para garantizar densidad proporcional al tamaño del pozo. Se elimina el color de zona (fondo coloreado) para un aspecto más limpio y fiel a la referencia.

## Risks / Trade-offs

- **Colisión de etiquetas de yacimiento con otras etiquetas izquierdas (tubing, rods)** → Mitigación: las etiquetas de yacimiento se posicionan más a la izquierda que las de tubing/rods usando un offset mayor (`-120px` desde x1).
- **Perforaciones sin `yacimiento`/`arena` asignados** → Se renderizan normalmente sin etiquetas; no hay cambio visual en datos existentes.
- **Intervalos muy pequeños** (`base - top` < 10 ft) pueden mostrar solo 2 líneas → Aceptable; `numShots` tiene un mínimo de 2.

## Migration Plan

1. Actualizar tipo `Perforation` y factory — sin cambios en datos serializados (campos opcionales)
2. Actualizar `PerforationLayer` — cambio visual puro, sin efecto en datos
3. Actualizar `LabelsLayer` + `useLabelsStore` — nueva categoría con default `false`
4. Actualizar editor UI — nuevos campos opcionales en el formulario existente

Sin rollback especial: todos los cambios son aditivos o de presentación.

## Open Questions

- ¿Debería el corchete de yacimiento mostrarse aunque no haya `arena` asignada (solo `yacimiento`)? → Por defecto sí, mostrando solo el nivel de yacimiento con sus intervalos directamente.
- ¿El espesor del intervalo `(n)'` se muestra en pies o metros? → Por ahora siempre en pies, consistente con el resto del diagrama.
