# Profile Panel Fills Half-Section Space

## ¿Por qué?

El feature original de profile-panel (`2026-05-06-profile-panel`) acomoda los tracks a la derecha del diagrama en orientación vertical. Al activar `halfSection: true`, el diagrama solo dibuja una mitad y la otra queda como espacio visual vacío — el panel sigue rígidamente en su slot lateral original. Resultado: en `vertical + halfSection + profiles` hay un hueco en el medio que no se aprovecha.

Este change cierra esa brecha: cuando se combinan los dos features en orientación vertical, el panel se expande para ocupar la mitad liberada por la half-section.

## ¿Qué cambia?

`WellDiagram` detecta la combinación `vertical + halfSection + hasProfiles` y aplica un layout alternativo:

- El diagrama mantiene su `configW` completo (`size.width - 50`) — solo dibuja una mitad por la half-section, como hoy.
- El panel se posiciona en el lado opuesto al `halfSide` y ocupa la mitad liberada.
- Cada track crece para llenar la mitad: `effectiveTrackWidth = max(profileTrackWidth, halfAvailable / N)`.
- `profileTrackWidth` se vuelve un *mínimo* (no un valor fijo) en este modo. Si el consumidor configura un mínimo mayor que el slot disponible, el panel "rebasa" su slot ideal y solapa visualmente con el diagrama (tradeoff aceptado).

## Alcance

- Solo orientación vertical. Horizontal + half-section queda con el layout actual (panel debajo) — deferido a una iteración futura.
- Backward-compatible al 100%: el comportamiento sin half-section o sin profiles no cambia.
- Sin nuevos props. Sin nuevos tipos. Es un ajuste de layout interno en `WellDiagram`.

## Fuera de alcance

- Horizontal + half-section + panel-fill (deferido).
- Cualquier nueva configuración del usuario (sin nuevos props).
