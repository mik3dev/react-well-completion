# Design

## Detección del modo

```ts
const isH = (well.orientation ?? 'vertical') === 'horizontal';
const halfSection = well.halfSection ?? false;
const halfSide = well.halfSide ?? 'right';
const halfSecPanelFill = !isH && halfSection && hasProfiles;
```

## Cálculo del track width

```ts
const halfAvailableW = (size.width - 50) / 2;
const effectiveTrackWidth = halfSecPanelFill && safeProfiles.length > 0
  ? Math.max(profileTrackWidth, halfAvailableW / safeProfiles.length)
  : profileTrackWidth;
const panelWidth = hasProfiles ? safeProfiles.length * effectiveTrackWidth : 0;
```

`profileTrackWidth` se vuelve un *mínimo*. El panel puede rebasar el slot si el mínimo es muy grande — aceptado.

## Cálculo de configW

| Caso | configW |
|---|---|
| Horizontal | `size.height - 100 - panelHeight` (igual que antes) |
| Vertical + half-sec + profiles (fill) | `size.width - 50` (full — el diagrama solo usa una mitad) |
| Vertical + profiles (sin half-sec) | `size.width - 50 - panelWidth` (igual que antes) |
| Vertical sin profiles | `size.width - 50` (igual que antes) |

## Posición del panel

| Caso | `panelOffsetX` |
|---|---|
| Estándar (no half-sec) | `size.width - panelWidth` (derecha, igual que antes) |
| Half-sec fill, `halfSide='right'` | `45` (panel a la izquierda, justo después del eje de profundidad) |
| Half-sec fill, `halfSide='left'` | `45 + halfAvailableW` (panel a la derecha de la mitad libre) |

## Layout visual

```
halfSide='right' (diagrama dibujado en la mitad derecha):
| 0  | 45 |          panelOffsetX=45         |  centerLine=45+halfW  |  diagrama  |
| chrome |  panel (occupies halfAvailableW)  |       (vacío visual ya cubierto)    |
                                              ↑
                                       diagrama-half se dibuja a la derecha de centerLine

halfSide='left' (diagrama dibujado en la mitad izquierda):
| 0  | 45 |  diagrama  |  centerLine=45+halfW  |          panelOffsetX=45+halfW   |
| chrome |  diagrama-half se dibuja a la izquierda de centerLine  |  panel       |
```

## Backward compatibility

- Sin profiles: ningún cambio. `halfSecPanelFill` es false → ruta legacy.
- Sin half-section: ningún cambio. `halfSecPanelFill` es false → ruta legacy.
- Solo cuando AMBOS están activos en vertical → nueva ruta.

## Out of scope

Horizontal + half-section + panel: el feature de profile-panel original ya pone el panel debajo del diagrama horizontal. No se cambia ese comportamiento. Si en el futuro se quiere que el panel ocupe la "mitad inferior vacía" cuando el diagrama horizontal tiene half-section, se aborda en una iteración futura.
