# Design

## Reutilización

El componente `ProfilePanel` ya construido en `2026-05-06-profile-panel` es orientation-agnostic — solo depende de `depthToPos`, dimensiones, y orientación. Se reutiliza tal cual en `SimplifiedDiagram` sin tocar su implementación.

## Cambios en SimplifiedDiagram

### Nuevos props (opcionales)

```ts
interface SimplifiedDiagramProps {
  well: Well;
  profiles?: Profile[];               // ← nuevo
  profileLayout?: ProfileLayout;      // ← nuevo (reservado, solo 'tracks' en v1)
  profileTrackWidth?: number;         // ← nuevo (default: 140 px)
}
```

### Cálculo de configW / configH

Mismo patrón que `WellDiagram` pero con las dimensiones de chrome propias de `SimplifiedDiagram`:

| Caso | configW |
|---|---|
| Vertical sin profiles | `size.width - 40` (igual que antes) |
| Vertical con profiles | `size.width - 40 - panelWidth` |
| Horizontal sin profiles | `size.height - 60` (igual que antes) |
| Horizontal con profiles | `size.height - 60 - panelHeight` |

`configH` no cambia.

### Posición del panel

| Caso | Transform |
|---|---|
| Vertical | `translate(${size.width - panelWidth}, 0)` |
| Horizontal | `translate(35, ${20 + config.width})` |

Las constantes `35` y `20` son las márgenes propias de `SimplifiedDiagram` (vs `45` y `30` en `WellDiagram`).

### TooltipProvider

`SimplifiedDiagram` originalmente NO usaba `TooltipProvider` (ninguna de sus layers expone tooltips). Ahora se envuelve en él para soportar los tooltips de hover de la curva (mismos que `WellDiagram`).

## Por qué no implementamos half-section + fill aquí

Las layers de `SimplifiedDiagram` usan `computeCasingPositions` (legacy, simétrico, ignora `halfSection`) en lugar de `computeCasingSpans` (la versión abstracta que respeta half-section). Por eso `halfSection: true` en un `SimplifiedDiagram` no produce visualmente media sección — el casing siempre se dibuja completo. Implementar el modo "panel fills the freed half" no tendría sentido cuando el diagrama no libera ningún hueco.

Si en el futuro se migran las layers simplified a `computeCasingSpans`, el modo half-section + fill se podría replicar (es el mismo patrón usado en `WellDiagram`).

## Backward compatibility

- Sin `profiles`: render bit-idéntico al anterior.
- Wrapping en `TooltipProvider`: agrega un context provider pero no afecta layout ni rendering visible.
- Build de la lib: 96.34 → 96.61 kB (~270 bytes adicionales, mayormente las imports y el wrapper).
