## Context

El diagrama de completación tiene un title-block "DETALLE DE POZO" implementado en `WellDetailLayer.tsx`. Se renderiza fuera del grupo rotado (funciona en vertical y horizontal). Usa constantes compartidas (`BOX_W=220`, `ROW_H=18`, `HEADER_H=24`) y un estilo de header oscuro + filas zebra.

Se necesitan 2 bloques adicionales: detalle de casings (tabla multi-columna) y detalle de tuberías (tabla multi-columna + bomba). Los datos ya existen en `Well.casings` y `Well.tubingString`.

## Goals / Non-Goals

**Goals:**
- Tablas SVG profesionales de casing y tubing con el mismo estilo visual que "DETALLE DE POZO"
- Cada bloque toggleable independientemente desde el labels store
- Apilamiento automático: si un bloque superior está oculto, los inferiores suben
- Exportable junto con PNG/SVG (ya está dentro del SVG)

**Non-Goals:**
- No se agregan campos nuevos al modelo de datos (todo ya existe en los tipos)
- No se implementa edición inline de datos desde las tablas
- No se implementa el Panel de Perfiles (Sección 4 del plan general)

## Decisions

### 1. Componente reutilizable `DetailBlock`

**Decisión:** Extraer un componente `DetailBlock` que encapsula el estilo compartido (shadow, background, header, zebra rows, separators). Los 3 bloques lo usan.

**Alternativa:** Duplicar el JSX en cada bloque. Descartado por mantenibilidad.

**Interface:**
```typescript
interface DetailBlockProps {
  title: string;
  headers?: string[];        // columnas de tabla (si aplica)
  rows: (string | number)[][]; // datos por fila
  colWidths?: number[];       // ancho relativo de cada columna
  y: number;                  // posición Y acumulada
  onHeight?: (h: number) => void; // reportar altura para apilamiento
}
```

### 2. Ancho de tablas: 280px

**Decisión:** Usar `BOX_W=280` para las tablas de casing y tubing (tienen más columnas que el detalle de pozo). El detalle de pozo se amplía al mismo ancho para consistencia visual.

**Alternativa:** Mantener 220px y comprimir columnas. Descartado porque el texto se superpone.

### 3. Apilamiento dinámico

**Decisión:** Cada bloque reporta su altura. El siguiente bloque se posiciona en `prevY + prevHeight + GAP`. Si un bloque está oculto (toggle off), su altura es 0 y el siguiente sube.

Orden fijo: Pozo → Casing → Tuberías.

### 4. Formato de diámetros de casing

**Decisión:** Reutilizar la función `fmtDiameter` existente en `CasingLayer.tsx`. Extraerla a un util compartido o copiar inline.

## Risks / Trade-offs

- **Overflow vertical**: Si hay muchos casings (>6) o segmentos de tubing (>8), las tablas pueden exceder la altura del SVG → Mitigación: agregar guard `if (totalHeight > config.height * 0.8) return null` o scroll visual.
- **Ancho en pantallas pequeñas**: 280px puede no caber si `config.width < 350` → Mitigación: mantener guard existente `if (config.width < 300) return null`.
