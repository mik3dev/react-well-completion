## Context

La Sección 1 implementó `diameterToSpan` que ya retorna solo media sección cuando `halfSection === true`. Sin embargo, los layers dibujan usando `{ x1, x2 }` de `diameterToX` (alias de `diameterToSpan`) y asumen simetría — dibujan pared izquierda y derecha, perforaciones a ambos lados, etc. Para half-section, cada layer debe renderizar solo el lado visible.

Estado actual: `diameterToSpan` con `halfSection=true, halfSide='right'` retorna `{ a: centerLine, b: centerLine + halfW }`. Los layers reciben esto via `diameterToX` como `{ x1: centerLine, x2: centerLine + halfW }`.

## Goals / Non-Goals

**Goals:**
- Cada layer renderiza solo el lado visible en half-section
- Línea de eje central punteada indica el corte
- Casings muestran una sola pared + shoe parcial (media V)
- Labels se posicionan en el lado visible
- Resultado visual profesional tipo plano de ingeniería

**Non-Goals:**
- Soporte horizontal (Sección 3 — se hará después)
- Interacción drag para mover la línea de corte
- Diferentes niveles de corte (siempre por el centro)

## Decisions

### 1. Condicional `config.halfSection` en cada layer

**Decisión:** Cada layer verifica `config.halfSection` y ajusta su renderizado. En half-section, solo se dibuja el lado indicado por `halfSide`.

**Razón:** Es explícito y fácil de debuggear. La alternativa de usar clip-path SVG global ocultaría los elementos pero no eliminaría elementos innecesarios del DOM.

### 2. Línea de eje como layer dedicado en WellDiagram

**Decisión:** Agregar una línea dashed en `centerLine` como parte del render en WellDiagram (no un layer separado), solo cuando `halfSection` está activo.

**Razón:** Es un solo elemento SVG, no justifica un componente dedicado.

### 3. Casings en half-section: una pared + medio shoe

**Decisión:** En half-section, CasingLayer dibuja solo la pared del lado visible (ej: solo la derecha si `halfSide='right'`). El shoe se dibuja como media V.

### 4. Tubing/Rods en half-section

**Decisión:** Tubing dibuja solo una línea de pared (la del lado visible). Rods dibujan un rectángulo desde centerLine hasta el borde del rod.

### 5. Labels en half-section

**Decisión:** Los labels se posicionan en el lado visible. Para `halfSide='right'`, labels van a la derecha del diagrama. La lógica de `rightMargin` y `leftMargin` se ajusta según el lado.

## Risks / Trade-offs

- **Complejidad en AccessoriesLayer** → Tiene muchos sub-componentes (packers, nipples, sleeves, etc.). Cada uno necesita adaptarse. Mitigación: solo renderizar iconos del lado visible.
- **Pump icons** → Los iconos de bomba (BM, BCP, BES) son componentes SVG complejos. En half-section se renderizan desde centerLine hacia el lado visible. Puede requerir ajustar el x/width de los iconos.
- **Hatch patterns en casings** → El hatch pattern sigue igual, solo cambia el rect que lo contiene.
