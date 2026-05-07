# Profile Panel in SimplifiedDiagram

## ¿Por qué?

El feature original de profile-panel solo aplica a `WellDiagram`. `SimplifiedDiagram` (la versión esquemática en escala de grises, pensada para reportes y PDFs) no exponía profiles. Sin embargo, el caso de uso real más común para combinar pozo + curvas (presión, temperatura, registros) es justo en reportes — donde el diagrama esquemático es el formato estándar de la industria petrolera.

Este change extiende el feature de profiles a `SimplifiedDiagram`, manteniendo idéntica semántica del API.

## ¿Qué cambia?

`SimplifiedDiagram` acepta los mismos tres props opcionales que `WellDiagram`: `profiles`, `profileLayout`, `profileTrackWidth`. Cuando se proveen, se renderiza el panel de tracks paralelos compartiendo el eje de profundidad (mismo `ProfilePanel` reutilizado).

- **Vertical**: panel a la derecha del diagrama (igual que `WellDiagram`).
- **Horizontal**: panel debajo del diagrama, sobre el eje de profundidad (igual que `WellDiagram`).
- **Tooltip**: hover sobre cada punto muestra valor y profundidad (mismo formato).

## Alcance

- Backward-compatible al 100%: sin el prop `profiles`, el render es bit-idéntico al anterior.
- Sin nuevos tipos públicos (los de `Profile`, `ProfilePoint`, `ProfileLayout` ya existen).
- `SimplifiedDiagram` ahora se envuelve en `TooltipProvider` para soportar el hover de la curva.

## Fuera de alcance

- **Half-section + panel-fill en simplified**: las layers de `SimplifiedDiagram` (`SimplifiedCasingLayer`, etc.) usan `computeCasingPositions` legacy (siempre simétrico, ignora `halfSection`). Por eso el modo half-section + fill no aplica visualmente aquí. Si en el futuro se migra `SimplifiedDiagram` para soportar half-section, se aborda en otra iteración.
- Sin nuevos props.
