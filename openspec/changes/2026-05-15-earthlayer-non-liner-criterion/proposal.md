# EarthLayer Uses Non-Liner Shoe Criterion + Configurable Fill

## ¿Por qué?

La `EarthLayer` original renderizaba la formación entre `totalFreeDepth` (HUD) y `totalDepth`. Esto resulta en una franja casi invisible en pozos donde HUD está cerca de la profundidad total — por ejemplo VLG3873 (HUD=16233, totalDepth=16377), donde con γ=1.5 el rango de 144 ft se traduce a ~16 píxeles verticales, prácticamente imperceptible.

Conceptualmente, HUD es una restricción operacional (pescados, tapones, profundidad útil) que no cambia dónde está físicamente expuesta la formación. La formación está expuesta donde la única protección entre el wellbore y la roca es un liner — es decir, debajo del shoe del último casing no-liner.

## ¿Qué cambia?

### Criterio del rango de profundidad

Antes:
```ts
if (!totalFreeDepth || totalFreeDepth >= totalDepth) return null;
const segments = computeEarthSegments(totalFreeDepth, totalDepth, casings);
```

Después:
```ts
const nonLinerCasings = casings.filter(c => !c.isLiner);
if (nonLinerCasings.length === 0) return null;
const earthTop = Math.max(...nonLinerCasings.map(c => c.base));
if (earthTop >= totalDepth) return null;
const segments = computeEarthSegments(earthTop, totalDepth, casings);
```

Aplicado a VLG3873:
- Antes: earth desde 16233 a 16377 = **144 ft** (~16 px en 1200 px de canvas).
- Después: earth desde 14650 (shoe del casing intermedio 9-5/8") a 16377 = **1727 ft** (~190 px).

### Fill configurable

- Nueva propiedad `earthFill` en `BrandTheme` (default `'url(#earthFill)'`).
- Nueva propiedad `earthFill` en `SimplifiedDiagramProps` (default `'transparent'`).
- El consumidor puede pasar cualquier valor CSS válido: color hex, palabra clave (`'transparent'`, `'white'`), o referencia a un pattern SVG.

### EarthLayer ahora también en SimplifiedDiagram

`SimplifiedDiagram` no renderizaba earth antes. Ahora reutiliza el mismo `EarthLayer` (el componente es agnóstico de la orientación / tema), con default `transparent` para preservar el look schematic. El consumidor opta in pasando un fill visible.

### Inferencia de `isLiner` en `parseBackendWell`

El nuevo criterio depende fuertemente de que `isLiner` esté correctamente seteado. Algunos backends meten TODO en el array `Casing[]` (incluyendo liners reales) y dejan `Liner[]` vacío. Para protegernos contra esa data mal clasificada, ahora `parseBackendWell`:

- Items en `Liner[]` → siempre `isLiner: true` (sin cambios).
- Items en `Casing[]` con `Tope (pies) > 0` → `isLiner: true` (inferido, nuevo).
- Items en `Casing[]` con `Tope (pies) === 0` → `isLiner: false` (lo esperado: llega a superficie).

Convención industrial: un liner es un casing que cuelga de otro casing, no del wellhead — equivalente a `top > 0`. Esto evita que la EarthLayer no renderice por datos mal clasificados.

## Alcance

- Cambio visual: solo afecta cómo se determina y pinta la zona de earth.
- Backward-compatible parcial: el rango de profundidad **sí cambia** en pozos donde `max(non-liner shoe) < HUD`. Esto es intencional — el nuevo criterio es más correcto petrofísicamente.
- Backward-compatible total para fill: el default mantiene `'url(#earthFill)'` (textura actual).

## Fuera de alcance

- Cambiar el comportamiento de HUD en otros lugares del diagrama (tooltips, métricas).
- Renderizar la formación cuando no hay casings (edge case raro).
