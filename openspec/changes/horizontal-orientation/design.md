## Context

El diagrama actual renderiza vertical: depth → eje Y (arriba→abajo), diameter → eje X (simétrico). La infraestructura abstracta ya existe:
- `depthToPos`: en horizontal mapea depth → X (izquierda→derecha) con gamma
- `diameterToSpan`: en horizontal mapea diameter → Y (simétrico desde centerY)
- `centerLine`: en horizontal = height/2

Los layers actualmente usan `depthToPos` para coordenada Y y `diameterToX` para X. En horizontal, `depthToPos` retorna un valor X y `diameterToSpan` retorna valores Y, pero los layers aún dibujan asumiendo vertical (ej: `<line x1={x1} y1={y} ... />` donde y=depthToPos).

### Estrategia clave: swap de ejes en cada layer

En vez de un transform global (que rotaría textos), cada layer usa:
- **Vertical**: `depthToPos` → y coordinate, `diameterToSpan.a/b` → x coordinates
- **Horizontal**: `depthToPos` → x coordinate, `diameterToSpan.a/b` → y coordinates

Para minimizar cambios, se introducen helpers `pos` y `span` que asignan las coordenadas al eje correcto.

## Goals / Non-Goals

**Goals:**
- El diagrama horizontal muestra tope a la izquierda, fondo a la derecha
- Labels legibles (no rotados 90°)
- Compatible con half-section (horizontal + half = tope izq, fondo der, media sección arriba o abajo)
- Exportación PNG/SVG funciona
- DepthAxis horizontal (ticks arriba o abajo)

**Non-Goals:**
- Soporte mixto (parte vertical, parte horizontal — pozos desviados)
- Zoom/pan
- Transición animada entre orientaciones

## Decisions

### 1. Helper functions para swap de ejes

**Decisión:** Crear funciones helper en cada layer (o importarlas de use-diagram-config):
```typescript
// En vertical: primary=Y, secondary=X
// En horizontal: primary=X, secondary=Y
const isH = config.orientation === 'horizontal';
```

Cada elemento SVG adapta sus atributos:
- Casing wall vertical: `<rect x={x1} y={y} width={WALL} height={h}>`
- Casing wall horizontal: `<rect x={pos} y={a} width={h} height={WALL}>`

**Razón:** Cada layer controla su orientación explícitamente. Los textos quedan legibles sin rotación.

### 2. SVG container en horizontal

**Decisión:** En horizontal, el translate cambia de `translate(45, 0)` (espacio para depth axis izq) a `translate(0, 30)` (espacio para depth axis arriba). El SVG usa el mismo width/height del container.

### 3. DepthAxis horizontal

**Decisión:** En horizontal, los ticks van arriba (o abajo) del diagrama con labels horizontales. Las grid lines son verticales.

### 4. Patterns y arrows se rotan via transform

**Decisión:** Los patterns SVG (casingHatch, earthFill, sand) se rotan 90° en horizontal usando `patternTransform="rotate(90)"` o definiendo patterns alternativos.

### 5. Label positioning en horizontal

**Decisión:** Labels de casings van arriba/abajo del diagrama (no izq/der). Labels de perforaciones, mandriles, etc. se posicionan arriba o abajo del casing exterior.

## Risks / Trade-offs

- **Complejidad por layer**: Cada layer necesita condicionales extensos para swappear ejes. Es la parte más intensiva del trabajo.
- **Labels legibilidad**: En horizontal con muchos equipos, los labels pueden superponerse. Mitigación: anti-overlap algorithm (ya existe para perforaciones, extender a otros).
- **Patterns rotados**: Algunos patterns pueden verse diferente rotados. Testing visual necesario.
- **Half-section + horizontal**: Combinar ambos modos requiere testing cuidadoso.
