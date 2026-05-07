# Design

## Detección del modo

```ts
const isH = (well.orientation ?? 'vertical') === 'horizontal';
const halfSection = well.halfSection ?? false;
const halfSide = well.halfSide ?? 'right';
const halfSecPanelFillV = !isH && halfSection && hasProfiles;
const halfSecPanelFillH =  isH && halfSection && hasProfiles;
```

## Cálculo del track sizing

**Vertical:**
```ts
const halfAvailableW = (size.width - 50) / 2;
const effectiveTrackWidth = halfSecPanelFillV && safeProfiles.length > 0
  ? Math.max(profileTrackWidth, halfAvailableW / safeProfiles.length)
  : profileTrackWidth;
const panelWidth = hasProfiles ? safeProfiles.length * effectiveTrackWidth : 0;
```

**Horizontal:**
```ts
const halfAvailableH = (size.height - 100) / 2;
const effectiveTrackHeightH = halfSecPanelFillH && safeProfiles.length > 0
  ? Math.max(profileTrackWidth, halfAvailableH / safeProfiles.length)
  : profileTrackWidth;
const panelHeight = isH && hasProfiles
  ? safeProfiles.length * effectiveTrackHeightH
  : 0;
```

`profileTrackWidth` se vuelve un *mínimo*. El panel puede rebasar el slot si el mínimo es muy grande — aceptado.

## Cálculo de configW

| Caso | configW |
|---|---|
| Horizontal estándar | `size.height - 100 - panelHeight` |
| Horizontal + half-sec + profiles (fill) | `size.height - 100` (full — el diagrama solo usa una mitad) |
| Vertical + half-sec + profiles (fill) | `size.width - 50` (full — el diagrama solo usa una mitad) |
| Vertical + profiles (sin half-sec) | `size.width - 50 - panelWidth` |
| Vertical sin profiles | `size.width - 50` |

## Posición del panel

**Vertical:**

| Caso | `panelOffsetX` |
|---|---|
| Estándar (no half-sec) | `size.width - panelWidth` (derecha, igual que antes) |
| Half-sec fill, `halfSide='right'` | `45` (panel a la izquierda, justo después del eje de profundidad) |
| Half-sec fill, `halfSide='left'` | `45 + halfAvailableW` (panel a la derecha de la mitad libre) |

**Horizontal:**

| Caso | `panelOffsetY` |
|---|---|
| Estándar (no half-sec) | `30 + config.width` (debajo del diagrama, igual que antes) |
| Half-sec fill, `halfSide='right'` | `30 + halfAvailableH` (panel en la mitad inferior) |
| Half-sec fill, `halfSide='left'` | `30` (panel en la mitad superior) |

La rotación SVG `-90°` hace que `halfSide='right'` (en local coords) caiga en la mitad superior del SVG (menor screen Y). Por eso el panel va al lado opuesto.

## Layout visual — vertical

```
halfSide='right' (diagrama dibujado en la mitad derecha):
| 0  | 45 |          panelOffsetX=45         |  centerLine=45+halfW  |  diagrama  |
| chrome |  panel (occupies halfAvailableW)  |       (vacío visual ya cubierto)    |

halfSide='left' (diagrama dibujado en la mitad izquierda):
| 0  | 45 |  diagrama  |  centerLine=45+halfW  |          panelOffsetX=45+halfW   |
| chrome |  diagrama-half se dibuja a la izquierda de centerLine  |  panel       |
```

## Layout visual — horizontal

```
halfSide='right' (diagrama en mitad superior, panel en mitad inferior):
y=30           ┌──────────────────────────┐
               │   diagrama (mitad sup)    │
y=30+halfH     ├──────────────────────────┤
               │   panel (track 1)         │
               │   panel (track 2)         │
y=30+2*halfH   ├──────────────────────────┤
y=size.h-20    │   eje de profundidad      │
               └──────────────────────────┘

halfSide='left' (diagrama en mitad inferior, panel en mitad superior):
y=30           ┌──────────────────────────┐
               │   panel (track 1)         │
               │   panel (track 2)         │
y=30+halfH     ├──────────────────────────┤
               │   diagrama (mitad inf)    │
y=30+2*halfH   ├──────────────────────────┤
y=size.h-20    │   eje de profundidad      │
               └──────────────────────────┘
```

## Backward compatibility

- Sin profiles: ningún cambio. Ambos flags (`halfSecPanelFillV`/`H`) son false → ruta legacy.
- Sin half-section: ningún cambio. Ambos flags son false → ruta legacy.
- Solo cuando AMBOS están activos → nueva ruta (en vertical o en horizontal).
