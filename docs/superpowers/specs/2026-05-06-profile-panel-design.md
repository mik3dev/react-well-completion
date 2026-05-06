# Spec: Panel de Perfiles en `WellDiagram`

**Fecha**: 2026-05-06
**Autor**: brainstorming session
**Estado**: aprobado por el usuario, listo para plan de implementación
**Referencia previa**: [openspec/PLAN-diagram-modes.md](../../../openspec/PLAN-diagram-modes.md) (Sección 4 — quedó pendiente cuando se cerraron las secciones 1, 2 y 3)

---

## 1. Resumen

Extender el componente `WellDiagram` de `@mik3dev/react-well-completion` para que, cuando reciba un nuevo prop `profiles`, renderice tracks paralelos de perfiles (presión, temperatura, registros, etc.) compartiendo el eje de profundidad con el diagrama mecánico.

El feature se entrega como una extensión del componente existente (sin componente nuevo exportado), totalmente backward-compatible, con datos pasados por props (la lib no edita ni persiste profiles — eso es responsabilidad del consumidor).

## 2. Objetivos y no-objetivos

### Objetivos

- Renderizar uno o más perfiles a la derecha del diagrama (vertical) o debajo (horizontal).
- Eje de profundidad sincronizado pixel-perfect con el diagrama (incluyendo gamma γ=1.5).
- Tooltip al hover sobre cada punto del perfil.
- API pública mínima, extensible sin breaking changes.
- Cero cambios visuales cuando el prop `profiles` está ausente.
- Inclusión automática del panel en exportación PNG/SVG existente.

### No-objetivos (v1)

- Editor UI para crear/editar profiles (responsabilidad del consumidor).
- Modo overlay (curvas superpuestas en un solo panel) — la API queda preparada vía `profileLayout` pero solo se implementa `'tracks'`.
- Crosshair sincronizado entre diagrama y panel.
- Importación de archivos LAS u otros formatos de well-log.
- Downsampling automático para datasets grandes — documentamos límite recomendado de 500 puntos por profile.
- Soporte de dark mode formal (la lib no lo soporta hoy en general).

## 3. API pública

### Tipos nuevos (`src/types/profile.ts`)

```ts
export interface ProfilePoint {
  depth: number;   // pies
  value: number;   // unidad arbitraria, definida por `Profile.unit`
}

export interface Profile {
  id: string;
  name: string;            // header del track, e.g. "Presión"
  unit: string;            // sufijo del header, e.g. "psi"
  color?: string;          // opcional — paleta automática si falta
  scale?: {
    min?: number;
    max?: number;
  };                       // opcional — fuerza rango del eje de valor
  data: ProfilePoint[];    // pares depth/value, no requiere estar ordenado
}

export type ProfileLayout = 'tracks';
// Futuro: 'tracks' | 'overlay'. v1 solo implementa 'tracks'.
```

### Props nuevos en `WellDiagramProps`

```ts
interface WellDiagramProps {
  // ... existentes
  profiles?: Profile[];               // default: undefined → no panel
  profileLayout?: ProfileLayout;      // default: 'tracks'
  profileTrackWidth?: number;         // default: 140 (px)
}
```

`profileTrackWidth` representa:
- **Vertical**: ancho en píxeles de cada track (todos los tracks tienen el mismo ancho).
- **Horizontal**: alto en píxeles de cada track.

### Exports añadidos al barrel (`src/index.ts`)

- `Profile`, `ProfilePoint`, `ProfileLayout` (tipos)

## 4. Comportamiento

### 4.1 Cuando `profiles` está ausente o vacío

El componente se comporta exactamente como hoy. El SVG no contiene ningún elemento del panel. Cero overhead.

### 4.2 Layout vertical (orientación default)

```
┌─────────────────┬───────┬───────┐
│                 │ Pres. │ Temp. │
│                 │  psi  │  °F   │
│   Diagrama      ├───────┼───────┤
│   mecánico      │ ticks │ ticks │
│   (existente)   ├───────┼───────┤
│                 │       │       │
│                 │ curva │ curva │
│                 │       │       │
└─────────────────┴───────┴───────┘
                  ←  140px  →
```

Ancho total del SVG: `containerWidth`.
Ancho del diagrama: `containerWidth - (profiles.length × profileTrackWidth)`.
La lib no impone un ancho mínimo del diagrama: si el consumidor configura un layout que comprime demasiado, el render procede igual y la responsabilidad de garantizar espacio queda con el consumidor.

### 4.3 Layout horizontal

```
┌────────────────────────────────────┐
│                                    │
│   Diagrama horizontal (existente)  │
│                                    │
├────────────────────────────────────┤
│  P psi │ ticks │      curva        │
├────────────────────────────────────┤
│  T °F  │ ticks │      curva        │
└────────────────────────────────────┘
       ←  140px alto cada track  →
```

En horizontal, el header del track ocupa el lado izquierdo (texto vertical, `writing-mode: vertical-rl`), los ticks al lado, y la curva fluye horizontalmente con `depth → X`, `value → Y`.

### 4.4 Sincronización del eje de profundidad

Tanto el diagrama como cada track usan `config.depthToPos(depth)` del mismo `DiagramConfig`. Esto garantiza alineación pixel-perfect con la corrección gamma γ=1.5.

### 4.5 Cálculo de la escala del valor

Por cada profile:

1. `points = [...profile.data].sort((a, b) => a.depth - b.depth).filter(p => p.depth >= 0 && p.depth <= well.totalDepth)`
2. Sea `dataMin = Math.min(...points.map(p => p.value))`, `dataMax = Math.max(...points.map(p => p.value))`, `range = dataMax - dataMin` (o `Math.abs(dataMin) || 1` si `range === 0` para evitar padding cero).
3. Si `profile.scale?.min` definido → `min = scale.min`. Sino → `min = dataMin - 0.05 × range`.
4. Si `profile.scale?.max` definido → `max = scale.max`. Sino → `max = dataMax + 0.05 × range`.
5. Si `min > max` después de aplicar overrides, se reordenan: `[min, max] = [Math.min(min, max), Math.max(min, max)]`.
6. **Eje del valor — dirección**:
   - **Vertical**: el eje del valor es horizontal dentro del track. `min` se mapea al borde izquierdo del área de curva (`a`), `max` al borde derecho (`b`). Convención: valores bajos a la izquierda, altos a la derecha.
   - **Horizontal**: el eje del valor es vertical dentro del track. `min` se mapea al borde inferior del área de curva (mayor `y` en SVG), `max` al borde superior (menor `y`). Convención: valores bajos abajo, altos arriba.
7. `valueToPos(v) = a + ((v - min) / (max - min)) × (b - a)` donde `[a, b]` es el rango del eje secundario del track según la dirección de la sección 4.5.6.
8. Si `min === max` (todos los valores iguales o un solo punto tras overrides), `valueToPos(v) = (a + b) / 2` (línea recta al centro del track).

### 4.6 Render de la curva

Casos según `points.length` (después de ordenar/filtrar):

- **`length === 0`**: se renderiza solo el header y los ejes — track vacío. Ningún `<polyline>` ni `<circle>`.
- **`length === 1`**: un único `<circle r=3 fill=color>` visible en `(depthToPos(d), valueToPos(v))`. Este mismo elemento dispara el tooltip (no se monta hover dot adicional).
- **`length >= 2`**:
  - Un `<polyline>` con `stroke=color`, `stroke-width=1.5`, `fill=none` cuyos puntos son `(depthToPos(d), valueToPos(v))` por cada point.
  - Por cada point se monta un `<circle r=4 fill="transparent" stroke="transparent" pointer-events="all">` que dispara `onMouseEnter` para mostrar el tooltip.

### 4.7 Paleta automática de colores

Si `profile.color` no está definido, se usa el siguiente color del array según el índice del profile:

```ts
const DEFAULT_PROFILE_COLORS = [
  '#0ea5e9',  // sky-500
  '#ef4444',  // red-500
  '#10b981',  // emerald-500
  '#f59e0b',  // amber-500
  '#8b5cf6',  // violet-500
  '#ec4899',  // pink-500
];
// Cycling después del índice 5
```

Si el consumidor pasa `color` explícito, ese color se usa siempre — la paleta es solo fallback.

### 4.8 Tooltip

Reusa el `TooltipProvider` y componente `Tooltip` existentes. Formato:

```
{name}: {value} {unit} @ {depth} ft
```

Ejemplo: `Presión: 2450 psi @ 1240 ft`.

`value` se redondea a 2 decimales si tiene fracción. `depth` siempre entero.

## 5. Arquitectura de archivos

```
packages/react-well-completion/src/
├── types/
│   ├── profile.ts                    # Tipos públicos: Profile, ProfilePoint, ProfileLayout
│   └── index.ts                      # Re-exporta tipos
├── components/
│   ├── WellDiagram.tsx               # Modificado: descuenta espacio y monta panel
│   └── profiles/                     # Nuevo directorio
│       ├── ProfilePanel.tsx          # Orquesta los tracks
│       ├── ProfileTrack.tsx          # Header + ejes + área de curva
│       ├── ProfileCurve.tsx          # Polyline + hover dots
│       └── profile-utils.ts          # sortAndFilterPoints, buildScale, paleta
├── hooks/
│   └── use-profile-scales.ts         # Memoiza scales por profile
├── __tests__/
│   ├── profile-utils.test.ts         # Tests unitarios puros
│   ├── ProfilePanel.test.tsx         # Tests de render
│   └── smoke.test.tsx                # Extendido con profiles
└── index.ts                          # Exporta tipos nuevos
```

### 5.1 Por qué separar `ProfileCurve` de `ProfileTrack`

La curva es el único elemento cuyo render varía entre vertical y horizontal (mapeo de depth/value a X/Y se invierte). El track maneja header, ticks, grid lines, layout — todo se reutiliza entre orientaciones con cambios mínimos.

### 5.2 Integración en el SVG root

El panel se renderiza **dentro del mismo `<svg>` root** que el diagrama. Esto garantiza:
- El export PNG/SVG existente captura todo sin cambios.
- Los `<defs>` (`SvgDefs`) están disponibles globalmente.
- El `TooltipProvider` envolvente cubre ambos.

## 6. Estilos (defaults)

| Elemento | Estilo |
|---|---|
| Track border | `1px solid #d4d4d8` |
| Header background | `#f4f4f5` |
| Header text | `font-size: 11px, fill: #52525b, font-weight: 500` |
| Axis ticks (3 ticks: min, mid, max) | `font-size: 9px, fill: #71717a` |
| Grid lines | `stroke: #e4e4e7, stroke-dasharray: 2 2` |
| Curva | `stroke-width: 1.5`, color del profile |
| Hover dots | `r: 4, fill/stroke: transparent` |

Estos valores están alineados con el `defaultTheme` actual y no introducen tokens nuevos. Si en el futuro se requiere customización de tema, se añade una sección `profile` al `BrandTheme`.

## 7. Edge cases

| Caso | Comportamiento |
|---|---|
| `profiles === undefined` | Panel no se renderiza, layout intacto |
| `profiles === []` | Panel no se renderiza |
| Profile con `data: []` | Track con header y ejes, sin curva |
| Profile con `data.length === 1` | Punto único como `<circle>` visible |
| Todos los `value` iguales (`min === max`) | Línea vertical en el centro del track |
| `depth` fuera del rango [0, totalDepth] | Punto filtrado silenciosamente |
| `data` desordenado | Se ordena internamente sin mutar el input |
| `scale.min > scale.max` | Saneamiento automático: se reordena `[min, max] = [Math.min(min, max), Math.max(min, max)]` antes de calcular `valueToPos` (ver 4.5.5) |
| Profile con 1000+ puntos | Renderiza correctamente pero documentamos `<500` recomendado |
| Cambio dinámico de `profiles` | `useMemo` recalcula scales; layout se ajusta vía `ResizeObserver` ya existente |

## 8. Backward compatibility

- Todos los props nuevos son opcionales.
- Sin pasar `profiles`, el render es bit-idéntico al actual.
- No se modifica el modelo `Well` (los profiles van por prop separado, no embebidos en el well).
- No se renombran ni eliminan exports existentes.

## 9. Testing

### 9.1 Vitest unit tests (`__tests__/profile-utils.test.ts`)

- `sortAndFilterPoints`:
  - Ordena por `depth` ascendente.
  - Filtra puntos con `depth < 0` o `depth > totalDepth`.
  - No muta el input.
- `buildScale`:
  - Auto-min/max con padding 5%.
  - Override con `scale.min` y `scale.max`.
  - Edge case `min === max`.
  - Sanitización si `scale.min > scale.max`.
- `valueToPos`:
  - Mapeo lineal correcto en `min`, `mid`, `max`.
- `getProfileColor` (paleta):
  - Color explícito tiene prioridad.
  - Cycling después del índice 5.

### 9.2 Render tests (`__tests__/ProfilePanel.test.tsx`)

- 0 profiles → no se monta el panel.
- 1 profile → 1 track con header `Nombre unit` y un `<polyline>`.
- N profiles → N tracks; ancho/alto total esperado.
- Profile con `data: []` → header + ejes presentes, sin polyline ni circles.
- Profile con `data.length === 1` → `<circle>` visible.
- Tooltip aparece al simular `mouseEnter` sobre un hover dot.
- Snapshots: vertical (2 profiles), horizontal (2 profiles).

### 9.3 Smoke test extendido (`__tests__/smoke.test.tsx`)

- `<WellDiagram well={…} />` sigue rindiendo (regresión).
- `<WellDiagram well={…} profiles={[mockProfile]} />` rinde sin errores.

### 9.4 Cobertura

Objetivo 80%+ sobre los archivos nuevos en `components/profiles/`, `types/profile.ts`, `hooks/use-profile-scales.ts`. La cobertura del resto de la lib no se ve afectada.

## 10. Export PNG/SVG

Sin cambios. Como el panel está en el mismo `<svg>` root, `useExport` del demo-app y cualquier consumidor que use `html-to-image` u otra herramienta de captura SVG-a-imagen lo incluye automáticamente.

## 11. Demo-app

Para validación visual:

- Añadir un mock de profiles a un pozo en `packages/demo-app/src/data/example-wells.ts` o pasarlos inline en `App.tsx`.
- Sin nuevo editor UI ni cambios en el `WellEditor.tsx` — fuera de alcance.

## 12. OpenSpec change

Crear `openspec/changes/2026-05-06-profile-panel/` con:

- `proposal.md` — descripción + razones, citando [PLAN-diagram-modes.md Sección 4](../../../openspec/PLAN-diagram-modes.md).
- `design.md` — copia/resumen de este spec.
- `tasks.md` — checklist de implementación (orden de la sección 13).
- `specs/profile-panel/spec.md` — requirements + scenarios para cada decisión clave.

## 13. Plan de rollout

1. Tipos (`profile.ts`) + utils + tests unitarios → unidad aislada.
2. `ProfileCurve` + tests aislados (sin contexto del diagrama).
3. `ProfileTrack` + tests aislados.
4. `ProfilePanel` orquestador + integración con `DiagramConfig`.
5. Modificar `WellDiagram.tsx`: descontar espacio, montar panel en el SVG root.
6. Modo horizontal — extiende el rendering ya hecho con writing-mode y curva rotada.
7. Tooltip integration — hover dots + uso de `TooltipProvider`.
8. Datos de ejemplo en demo + verificación visual con los 4 pozos existentes.
9. Tests de snapshot + smoke extendido.
10. OpenSpec change + commit con `feat:` + PR.

## 14. Versionado

API pública nueva (tipos + props): bump **minor**, `0.1.4 → 0.2.0`. Release-please debe detectarlo desde el `feat:` commit.

## 15. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Performance con muchos puntos (>1000) | Documentar límite recomendado <500 puntos por profile en v1; downsampling diferido a v2 |
| Resize observer dispara re-render frecuente | Usar `useMemo` con dependencias estables sobre `profiles` y `profileTrackWidth` |
| Color de paleta poco contrastado en fondo no-blanco | El consumidor controla `color` explícitamente; la lib no soporta dark mode hoy |
| Conflicto con tooltip del diagrama (mismo `TooltipProvider`) | El provider ya soporta múltiples consumidores; cada hover dot tiene contenido propio |
| Profiles mutan datos del consumidor | Defensivamente copiamos con `[...data]` antes de ordenar/filtrar |

## 16. Decisiones cerradas durante el brainstorming

1. **Alcance**: extensión del componente `WellDiagram` existente, props-driven, librería pura sin editor en demo. (Pregunta 1, opción A clarificada por el usuario).
2. **Multi-profile layout**: tracks paralelos. API extensible vía `profileLayout` con valor único `'tracks'` en v1. (Pregunta 2, opción B + extensibilidad).
3. **API shape**: `name`/`unit` requeridos, `color`/`scale` opcionales. (Pregunta 3, opción C).
4. **Orientación**: panel sigue la orientación del diagrama (vertical → derecha, horizontal → abajo). (Pregunta 4, opción A).
5. **Interactividad**: tooltip en hover, sin crosshair sincronizado. (Pregunta 5, nivel 2).
