# Design

## Cálculo del rango de profundidad

```ts
const nonLinerCasings = casings.filter(c => !c.isLiner);
if (nonLinerCasings.length === 0) return null;
const earthTop = Math.max(...nonLinerCasings.map(c => c.base));
if (earthTop >= totalDepth) return null;
```

### Casos de prueba (mentales)

| Pozo | Casings | Earth top | Comentario |
|---|---|---|---|
| VLG3873 (real) | 13-3/8" (4000), 9-5/8" (14650), liner 7" (16372) | 14650 | ✅ usable |
| Pozo solo con surface + producción + liner | Surface (2000), prod (8000), liner (10000) | 8000 | ✅ |
| Pozo sin liner, solo casings hasta TD | Surface (2000), prod (16000) | 16000 | `earthTop >= totalDepth` (si TD=16000) → no renderiza |
| Pozo solo con liner | Liner (4000-10000) | n/a | No renderiza (no hay non-liner) |
| Pozo sin casings | [] | n/a | No renderiza (no hay non-liner) |

## Fill configurable

### WellDiagram

```ts
interface BrandTheme {
  headerBg: string;
  accent: string;
  headerText: string;
  earthFill: string;  // ← nuevo
}

defaultTheme.earthFill = 'url(#earthFill)';
```

`WellDiagram` pasa `mergedTheme.earthFill` a `<EarthLayer fill={...} />`.

### SimplifiedDiagram

```ts
interface SimplifiedDiagramProps {
  // ...
  earthFill?: string;  // ← nuevo
}

const DEFAULT_SIMPLIFIED_EARTH_FILL = 'transparent';
```

Por qué transparent default: el `SimplifiedDiagram` es schematic en escala de grises. La textura marrón del earthFill chocaría con el look. Si el consumidor quiere verlo, pasa `earthFill="#fafafa"` o `'url(#earthFill)'` (este último requeriría que el consumidor incluya su propio pattern SVG).

### EarthLayer

```ts
interface Props {
  totalFreeDepth: number;
  totalDepth: number;
  casings: Casing[];
  config: DiagramConfig;
  fill?: string;  // ← nuevo, default 'url(#earthFill)'
}
```

`totalFreeDepth` ya no se usa para determinar el rango. Se mantiene en los props porque sigue apareciendo en el tooltip informativo cuando es > 0.

## Reutilización de EarthLayer en SimplifiedDiagram

`SimplifiedDiagram` importa `EarthLayer` desde `../layers/EarthLayer` y lo renderiza dentro del grupo principal de layers (antes de los demás layers, para que quede detrás). Esto evita duplicación de lógica y aprovecha el `useTooltip` hook que ya está disponible (SimplifiedDiagram ya envuelve en `TooltipProvider` desde la integración del profile-panel).

## Inferencia de `isLiner` en `parseBackendWell`

Para que el criterio del rango funcione bien en producción, depende de que los casings estén correctamente clasificados con `isLiner`. Pero hay backends (incluyendo el de uno de los clientes de esta lib) que clasifican TODO en el array `Casing[]` aunque haya liners reales:

```jsonc
{
  "Liner": [],
  "Casing": [
    { "OD": "13 3/8\"", "Tope (pies)": 0,     "Base (pies)": 3974 },
    { "OD": "9 5/8\"",  "Tope (pies)": 0,     "Base (pies)": 14507 },
    { "OD": "7\"",      "Tope (pies)": 13873, "Base (pies)": 16178 }  // ← un liner mal clasificado
  ]
}
```

Sin inferencia, el 7" se trataría como casing → `max(non-liner shoe) = 16178 ≈ totalDepth` → EarthLayer no renderiza.

**Regla agregada en `parseCasings`**:

```ts
const inferredIsLiner = isLiner || top > 0;
```

- Items del array `Liner[]` siguen siendo `isLiner: true` siempre.
- Items del array `Casing[]` con `top > 0` ahora se infiere `isLiner: true`.
- Items del array `Casing[]` con `top === 0` permanecen como `isLiner: false`.

Convención petrolera: un liner es un casing que **no llega a superficie** (cuelga de otro casing). `top > 0` captura exactamente esto.

## Backward compatibility

- **Visual del rango**: cambia en pozos donde el HUD usado a renderear antes era diferente del nuevo `max(non-liner shoe)`. Esto es el cambio intencional.
- **Fill**: 100% compatible. El default `'url(#earthFill)'` produce el mismo render que antes.
- **API**: solo aditivo. Nadie tiene que cambiar nada para usarlo.
- **`parseBackendWell` con datos bien clasificados**: 100% compatible. Los items de `Casing[]` con `top === 0` (la mayoría) siguen como antes. Solo se altera el resultado para items con `top > 0`, que antes quedaban mal clasificados como casings.
