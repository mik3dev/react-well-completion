# Plan: Orientación Horizontal, Medio Pozo, y Panel de Perfiles

## Resumen

Tres requerimientos que extienden el diagrama de completación:

1. **Orientación horizontal** — el pozo se dibuja de izquierda (tope) a derecha (fondo)
2. **Medio pozo (half-section)** — renderizar solo una mitad del pozo (corte por el centro)
3. **Panel de perfiles** — gráficos sincronizados de temperatura, presión, registro acústico

Estos se implementan en 4 secciones: primero una abstracción del sistema de coordenadas (prerequisito), luego cada feature.

---

## Estado actual de la arquitectura

### Sistema de coordenadas actual (hardcoded vertical)
- `depthToY(depth)` → mapea profundidad al eje Y (gamma 1.5, no lineal)
- `diameterToX(config, diameter)` → mapea diámetro al eje X (simétrico desde `centerX`)
- `computeCasingPositions()` → posiciones esquemáticas de casings (simétrico)
- SVG container: `<g transform="translate(45, 0)">` para eje de profundidad izquierdo

### Layers afectados (12 total)
Cada layer usa `depthToY` y/o `diameterToX` directamente. Para soportar orientación horizontal, **todos** deben usar funciones abstractas que mapen depth/diameter al eje correcto según orientación.

### Simetría
El diagrama es simétrico desde `centerX`. Para medio pozo, se renderiza solo un lado.

---

## Sección 1: Abstracción del Sistema de Coordenadas

> **Prerequisito** para orientación horizontal y medio pozo.
> Desacoplar el concepto "profundidad" y "diámetro" de los ejes X/Y físicos.

### Diseño

Extender `DiagramConfig` con funciones genéricas:

```typescript
interface DiagramConfig {
  // Existentes (se mantienen para compatibilidad)
  width: number;
  height: number;
  pulgada: number;
  pxPerFt: number;
  centerX: number;  // se renombra conceptualmente a centerLine
  maxDepth: number;
  depthToY: (depth: number) => number;

  // Nuevos
  orientation: 'vertical' | 'horizontal';
  halfSection: boolean;        // true = solo media sección
  halfSide: 'right' | 'left'; // cuál mitad mostrar

  // Funciones abstractas
  depthToPos: (depth: number) => number;       // depth → primary axis (Y vertical, X horizontal)
  diameterToSpan: (diameter: number) => { a: number; b: number }; // diameter → secondary axis (symmetric or half)
  centerLine: number;          // centro del eje secundario
}
```

**Vertical:**
- `depthToPos(d)` = `depthToY(d)` (eje Y)
- `diameterToSpan(d)` = `{ a: centerX - half, b: centerX + half }` (eje X)

**Horizontal:**
- `depthToPos(d)` = mapea depth al eje X (izquierda → derecha)
- `diameterToSpan(d)` = `{ a: centerY - half, b: centerY + half }` (eje Y)

**Medio pozo:**
- `diameterToSpan(d)` retorna solo una mitad: `{ a: centerLine, b: centerLine + half }` (right) o `{ a: centerLine - half, b: centerLine }` (left)

### Tareas

- [ ] 1.1 Agregar `orientation`, `halfSection`, `halfSide` al modelo `Well` (opcionales, default `vertical`, `false`, `right`)
- [ ] 1.2 Agregar campo `orientation` al `DiagramConfig` interface en `types/diagram.ts`
- [ ] 1.3 Extender `useDiagramConfig` con `depthToPos` y `diameterToSpan` que respeten orientación y medio pozo
- [ ] 1.4 Crear función `computeCasingSpans()` (equivalente a `computeCasingPositions` pero usando el eje abstracto)
- [ ] 1.5 Agregar controles de orientación y medio pozo al editor UI (selector/toggles)
- [ ] 1.6 Agregar al store `updateWellMeta` los nuevos campos

---

## Sección 2: Medio Pozo (Half-Section)

> Renderizar solo la mitad derecha o izquierda del pozo.
> Impacto moderado — cada layer necesita adaptarse a la asimetría.

### Diseño

Con la abstracción de Sección 1, `diameterToSpan` ya retorna la mitad correcta. Pero hay ajustes necesarios:

- **Casings**: dibujar solo una pared (la del lado visible) + el corte central como línea de eje
- **Tubing/Rods**: solo un lado de la línea doble, o línea simple en el centro
- **Perforaciones**: solo las del lado visible
- **Accessories** (packers, nipples, etc.): solo el lado visible
- **Labels**: ajustar márgenes (solo hay un lado)
- **Línea de eje**: dibujar una línea punteada en `centerLine` indicando el corte

### Tareas

- [ ] 2.1 Implementar lógica en `diameterToSpan` para retornar solo media sección
- [ ] 2.2 Adaptar **CasingLayer**: renderizar una sola pared + shoe parcial + línea de eje central
- [ ] 2.3 Adaptar **TubingLayer**: una sola línea de pared del tubing
- [ ] 2.4 Adaptar **RodLayer**: medio rectángulo o línea central
- [ ] 2.5 Adaptar **PerforationLayer**: perforaciones solo hacia un lado
- [ ] 2.6 Adaptar **AccessoriesLayer**: packers, nipples, sleeves, packings solo un lado; mandrels según side
- [ ] 2.7 Adaptar **PumpLayer**: media bomba (corte transversal)
- [ ] 2.8 Adaptar **WireLayer**: posición ajustada
- [ ] 2.9 Adaptar **EarthLayer** y **SandLayer**: llenar solo media sección
- [ ] 2.10 Adaptar **DepthAxisLayer**: mantener igual (siempre al lado del eje de profundidad)
- [ ] 2.11 Adaptar **LabelsLayer**: ajustar posición de labels según lado visible
- [ ] 2.12 Dibujar línea de eje central (dashed) en `centerLine`
- [ ] 2.13 Adaptar **WellDetailLayer**: reposicionar si colisiona
- [ ] 2.14 Testing visual con los 4 pozos de ejemplo en modo half-section

---

## Sección 3: Orientación Horizontal

> El pozo se dibuja horizontal: tope a la izquierda, fondo a la derecha.
> Impacto alto — todos los layers cambian de eje.

### Diseño

Con la abstracción de Sección 1, los layers usan `depthToPos` (ahora mapea al eje X) y `diameterToSpan` (ahora mapea al eje Y). Pero hay cambios adicionales:

- **SVG container**: el `translate(45, 0)` cambia a `translate(0, 45)` (eje de profundidad arriba o abajo)
- **DepthAxisLayer**: se convierte en eje horizontal (arriba o abajo)
- **Labels**: rotar o reposicionar texto para que sea legible horizontalmente
- **SvgDefs patterns**: los hatches/arrows se rotan 90°
- **Export**: el aspect ratio del SVG cambia (ancho >> alto)

### Estrategia de implementación

En vez de modificar cada layer con condicionales `if (horizontal)`, la estrategia recomendada es **aplicar un SVG transform al grupo raíz**:

**Opción A — Transform global (más simple, menos control):**
```tsx
<g transform="rotate(-90) translate(-height, 0)">
  {/* todos los layers sin cambios */}
</g>
```
Problema: los textos quedan rotados e ilegibles.

**Opción B — Abstracción por layer (más trabajo, mejor resultado):**
Cada layer usa `depthToPos` y `diameterToSpan` del config. Los layers dibujan en coordenadas abstractas y el resultado es horizontal nativo. Los textos se mantienen legibles.

**Recomendación: Opción B** — el resultado es profesional y los labels son legibles.

### Tareas

- [ ] 3.1 Implementar `depthToPos` horizontal en `useDiagramConfig`: depth → X con gamma correction
- [ ] 3.2 Implementar `diameterToSpan` horizontal: diameter → Y (simétrico desde `centerY`)
- [ ] 3.3 Adaptar **WellDiagram.tsx**: cambiar layout SVG y translate según orientación
- [ ] 3.4 Adaptar **DepthAxisLayer**: eje horizontal (ticks arriba, labels horizontales)
- [ ] 3.5 Adaptar **CasingLayer**: paredes horizontales (líneas horizontales en vez de verticales)
- [ ] 3.6 Adaptar **TubingLayer**: segmentos horizontales
- [ ] 3.7 Adaptar **RodLayer**: barras horizontales
- [ ] 3.8 Adaptar **PumpLayer**: iconos rotados o adaptados a orientación
- [ ] 3.9 Adaptar **PerforationLayer**: perforaciones arriba/abajo en vez de izquierda/derecha
- [ ] 3.10 Adaptar **AccessoriesLayer**: todos los accesorios en orientación horizontal
- [ ] 3.11 Adaptar **WireLayer**: cable BES horizontal
- [ ] 3.12 Adaptar **EarthLayer** y **SandLayer**: llenados horizontales
- [ ] 3.13 Adaptar **LabelsLayer**: posicionamiento de labels para diagrama horizontal
- [ ] 3.14 Adaptar **SvgDefs**: rotar patterns (hatch, arrows) según orientación
- [ ] 3.15 Adaptar **WellDetailLayer**: reposicionar
- [ ] 3.16 Adaptar **use-export.ts**: manejar aspect ratio horizontal
- [ ] 3.17 Testing visual con los 4 pozos en orientación horizontal
- [ ] 3.18 Testing visual: horizontal + half-section combinados

---

## Sección 4: Panel de Perfiles (Temperatura, Presión, Acústico)

> Segundo panel gráfico sincronizado con el eje de profundidad del diagrama principal.

### Diseño

Un panel adicional adyacente al diagrama del pozo, compartiendo el mismo eje de profundidad. Muestra curvas de línea (line charts) de variables de producción.

#### Modelo de datos

Agregar al `Well`:
```typescript
interface ProfilePoint {
  depth: number;   // pies
  value: number;   // unidad según tipo
}

interface WellProfile {
  id: string;
  type: 'temperature' | 'pressure' | 'acoustic' | 'custom';
  name: string;           // e.g. "Perfil de Temperatura"
  unit: string;           // e.g. "°F", "psi", "μs/ft"
  color: string;          // color de la curva
  data: ProfilePoint[];   // pares depth-value
}

interface Well {
  // ...existentes...
  profiles: WellProfile[];  // nuevo
}
```

#### Componente UI

- **ProfilePanel.tsx**: componente SVG separado que renderiza las curvas
- Comparte `depthToPos` del `DiagramConfig` para sincronizar el eje de profundidad
- Eje horizontal propio para el valor de cada perfil (con escala independiente)
- Múltiples perfiles superpuestos con colores distintos
- Grid lines sincronizadas con el diagrama principal

#### Layout

```
┌─────────────────────┬──────────────┐
│                     │              │
│   Well Diagram      │  Profile     │
│   (existente)       │  Panel       │
│                     │  (nuevo)     │
│                     │              │
└─────────────────────┴──────────────┘
```

En orientación horizontal:
```
┌─────────────────────────────────────┐
│        Well Diagram (horizontal)    │
├─────────────────────────────────────┤
│        Profile Panel (abajo)        │
└─────────────────────────────────────┘
```

### Tareas

- [ ] 4.1 Definir interfaces `ProfilePoint`, `WellProfile` en `types/well.ts`
- [ ] 4.2 Agregar `profiles: WellProfile[]` al `Well` interface
- [ ] 4.3 Crear factory `createProfile()` en `well-factory.ts`
- [ ] 4.4 Agregar datos de perfil de ejemplo a los pozos de ejemplo
- [ ] 4.5 Crear componente **ProfilePanel.tsx** que renderiza curvas SVG
  - [ ] 4.5.1 Eje de profundidad sincronizado con `depthToPos`
  - [ ] 4.5.2 Eje de valor horizontal con escala auto-calculada (min/max del dataset)
  - [ ] 4.5.3 Renderizar curvas como `<polyline>` o `<path>` con colores distintos
  - [ ] 4.5.4 Grid lines sincronizadas con DepthAxisLayer
  - [ ] 4.5.5 Leyenda de curvas (nombre + color + unidad)
  - [ ] 4.5.6 Tooltip al hover mostrando valor en la profundidad
- [ ] 4.6 Integrar **ProfilePanel** al layout en **App.tsx** / **WellDiagram.tsx**
  - [ ] 4.6.1 Layout vertical: panel a la derecha del diagrama
  - [ ] 4.6.2 Layout horizontal: panel debajo del diagrama
  - [ ] 4.6.3 Panel redimensionable (drag border) o ancho fijo configurable
- [ ] 4.7 Crear editor para perfiles en **WellEditor.tsx**
  - [ ] 4.7.1 Sección "Perfiles" con CRUD de perfiles
  - [ ] 4.7.2 Selector de tipo (temperatura, presión, acústico, custom)
  - [ ] 4.7.3 Input de datos: tabla depth/value con agregar/eliminar filas
  - [ ] 4.7.4 Importar datos de perfil desde CSV/texto
  - [ ] 4.7.5 Color picker para cada perfil
- [ ] 4.8 Toggle de visibilidad de perfiles individuales en labels store
- [ ] 4.9 Incluir ProfilePanel en exportación PNG/SVG
- [ ] 4.10 Testing visual con datos de ejemplo

---

## Orden de implementación recomendado

```
Sección 1 (Abstracción)     ← PREREQUISITO
    ├── Sección 2 (Medio Pozo)      ← independiente de 3
    ├── Sección 3 (Horizontal)       ← independiente de 2
    └── Sección 4 (Perfiles)         ← independiente de 2 y 3, pero usa depthToPos
```

**Fase 1**: Sección 1 (abstracción) — ~3-4 sesiones
**Fase 2**: Sección 2 (medio pozo) — ~2-3 sesiones
**Fase 3**: Sección 3 (horizontal) — ~4-5 sesiones (la más intensiva)
**Fase 4**: Sección 4 (perfiles) — ~3-4 sesiones

---

## Riesgos y consideraciones

1. **Regresiones visuales**: Cada cambio en el sistema de coordenadas puede romper layers existentes. Verificar visualmente los 4 pozos de ejemplo después de cada tarea.

2. **Labels en horizontal**: El texto horizontal ocupa más espacio que el vertical. Puede requerir compresión de fuente o rotación selectiva.

3. **Performance**: El panel de perfiles con muchos data points puede necesitar downsampling para datasets grandes.

4. **Export**: El panel de perfiles debe incluirse en las exportaciones PNG/SVG. Si es un SVG separado, hay que combinarlos.

5. **Backward compatibility**: Los campos nuevos en Well son opcionales. Wells existentes siguen funcionando sin migración.
