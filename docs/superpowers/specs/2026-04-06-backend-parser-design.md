# Design: Backend Parser y Ajustes de Types

## Objetivo

Adaptar el modelo de datos de la libreria para soportar la estructura del backend, y crear una funcion `parseBackendWell` que convierta el JSON crudo a un objeto `Well` tipado.

## Decisiones de Diseno

| Decision | Eleccion | Razon |
|---|---|---|
| Estrategia | Cambios en types + parser en un archivo | Directo, sin abstracciones innecesarias |
| TubingSegment | Agregar `top?`/`base?` opcionales | Soportar ambos formatos (length acumulada y top/base directo) |
| Mandrel.hasValve | Reemplazar con `valveType: 'operating' \| 'dummy' \| null` | Backend distingue tipos de valvula |
| Campos extras del backend | `metadata?: Record<string, unknown>` en Well | No tipar campos que no impactan el diagrama |
| Tipos no reconocidos de EquipoDeFondo | Guardar en `metadata.equipoDeFondoExtra` | Cuello Flotador y otros no se renderizan por ahora |
| Backward compat de hasValve | Romper directo | Pre-1.0, sin consumidores externos |
| Parser overrides | `parseBackendWell(json, { totalDepth?, liftMethod? })` | Backend puede enviar datos incompletos |

---

## Cambios en Types

### `TubingSegment`

```typescript
export interface TubingSegment {
  id: string;
  segment: number;
  diameter: number;       // pulgadas OD
  length: number;         // pies
  top?: number;           // pies (opcional)
  base?: number;          // pies (opcional)
  weight?: number;        // lb/ft
  grade?: string;         // e.g. 'P-110'
}
```

Rendering: si `top` y `base` presentes, usar directamente. Si no, calcular acumulando `length`.

### `Mandrel`

```typescript
export interface Mandrel {
  id: string;
  segment: number;
  depth: number;
  diameter: number;
  valveType: 'operating' | 'dummy' | null;
  ptrPsi?: number;
  flowDiameter?: string;
}
```

Reemplaza `hasValve: boolean`. `'operating'` = valvula activa, `'dummy'` = valvula dummy, `null` = sin valvula.

### `Well`

Agregar campo opcional:

```typescript
metadata?: Record<string, unknown>;
```

### `Sleeve`

Agregar campo opcional:

```typescript
comment?: string;
```

---

## Funcion `parseBackendWell`

### Archivo

`packages/react-well-completion/src/utils/parse-backend-well.ts`

### Signature

```typescript
interface ParseBackendWellOverrides {
  totalDepth?: number;
  liftMethod?: LiftMethod;
}

function parseBackendWell(
  json: Record<string, unknown>,
  overrides?: ParseBackendWellOverrides
): Well
```

### Reglas de Mapping

| Campo backend | Campo Well | Transformacion |
|---|---|---|
| `Pozo` | `name` | Directo |
| `HUD` | `totalFreeDepth` | Directo |
| `Profundidad Total` | `totalDepth` | Si es 0, calcular max(bases casings, perforations) |
| `Tipo de Trabajo` | `liftMethod` | Map: `CVGL→GL, BME→BM, BCP→BCP, BES→BES`. Default: `GL` |
| `Casing[].OD` | `casings[].diameter` | Parsear fracciones: `"13 3/8\"" → 13.375` |
| `Casing[].Tope/Base` | `casings[].top/base` | Directo |
| `Casing[].Weight/Grado` | `casings[].weight/grade` | Directo |
| `Liner[]` | `casings[]` con `isLiner: true` | Merge en el mismo array |
| `Tubing[].Tope/Base` | `tubingString[].top/base` | Directo. `length = base - top` |
| `Tubing[].OD/Weight/Grado` | `tubingString[].diameter/weight/grade` | OD parseado como fraccion |
| `Perforaciones[].Tope/Base` | `perforations[].top/base` | Directo |
| `Perforaciones[].Yacimiento` | `perforations[].yacimiento` | Directo. `type` default: `'shoot'` |
| `MadrilesValvulas[].PROF_TVD_1` | `mandrels[].depth` | Directo |
| `MadrilesValvulas[].Tamaño` | `mandrels[].diameter` | Directo |
| `MadrilesValvulas[].PTR PSI` | `mandrels[].ptrPsi` | Directo |
| `MadrilesValvulas[].Diámetro flujo` | `mandrels[].flowDiameter` | Directo |
| Mandrel con `PTR PSI` | `valveType: 'operating'` | Tiene presion = valvula operativa |
| Mandrel con `Tipo Válvula === 'Dummy'` | `valveType: 'dummy'` | Valvula dummy |
| Mandrel sin PTR ni Tipo | `valveType: null` | Sin valvula |
| `EquipoDeFondo` tipo `Niple` | `seatNipples[]` | `Profundidad → depth` |
| `EquipoDeFondo` tipo `Manga` | `sleeves[]` | `Profundidad → depth`, `Comentario → comment` |
| `EquipoDeFondo` tipo `Empacadura Permanente` | `packers[]` | `Profundidad → depth` |
| `EquipoDeFondo` tipos no reconocidos | `metadata.equipoDeFondoExtra` | Array de items crudos |
| `Comentario`, `Fecha *`, `Potencial *`, `FieldId`, `TDS`, etc. | `metadata` | Todos los campos no mapeados |

### Utilidad exportada: `parseFractionalDiameter`

```typescript
function parseFractionalDiameter(od: string): number
// "13 3/8\"" → 13.375
// "9 5/8\"" → 9.625
// "3.5" → 3.5
```

---

## Impacto en Layers de Rendering

### TubingLayer / SimplifiedTubingLayer

Si `seg.top` y `seg.base` definidos, usar directamente. Si no, acumular `length` como ahora. Backward compatible.

### MandrelLayer / SimplifiedMandrelLayer

- `valveType === 'operating'` → icono de valvula completo (actual `hasValve: true`)
- `valveType === 'dummy'` → icono de valvula con stroke dashed o color claro
- `valveType === null` → sin valvula (actual `hasValve: false`)

### LabelsLayer

Mandriles: `+VGL` si `operating`, `+Dummy` si `dummy`, nada si `null`.

### WellEditor (demo-app)

Toggle `hasValve` cambia a selector con 3 opciones: "Operativa", "Dummy", "Sin valvula".

---

## Exports Nuevos desde la Libreria

```typescript
export { parseBackendWell } from './utils/parse-backend-well';
export type { ParseBackendWellOverrides } from './utils/parse-backend-well';
export { parseFractionalDiameter } from './utils/parse-backend-well';
```

## Fuera de Alcance

- Nuevo tipo `FloatCollar` (va a metadata)
- Rendering de metadata en tablas de detalle
- Validacion con Zod del JSON de entrada
- Soporte para multiples formatos de backend
