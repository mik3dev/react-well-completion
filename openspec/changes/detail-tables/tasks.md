## 1. Labels Store — Nuevos toggles

- [ ] 1.1 Agregar `casingDetail` y `tubingDetail` a `LabelCategory` y `LABEL_CATEGORIES` en `labels-store.ts`, ambos habilitados por defecto

## 2. Refactorizar WellDetailLayer — Componente DetailBlock

- [ ] 2.1 Extraer componente `DetailBlock` reutilizable con props: title, headers (columnas opcionales), rows (datos), colWidths, y-offset; mantiene estilo visual actual (header oscuro, zebra, shadow)
- [ ] 2.2 Ampliar `BOX_W` a 280px para todos los bloques
- [ ] 2.3 Refactorizar el bloque "DETALLE DE POZO" existente para usar `DetailBlock`
- [ ] 2.4 Extraer `fmtDiameter` de `CasingLayer.tsx` a un util compartido (o copiar inline en WellDetailLayer)

## 3. Bloque DETALLE DE CASING

- [ ] 3.1 Implementar sección de casing dentro de WellDetailLayer: tabla con columnas Ø, Peso, Grado, Tope, Base, Tipo
- [ ] 3.2 Ordenar casings por diámetro descendente, formatear diámetro fraccional, mostrar "—" para campos vacíos
- [ ] 3.3 Guard: no renderizar si `casings.length === 0`
- [ ] 3.4 Respetar toggle `visible.casingDetail`

## 4. Bloque DETALLE DE TUBERÍAS

- [ ] 4.1 Implementar sección de tubing: tabla con columnas Seg., Ø, Long., Prof. Acum.
- [ ] 4.2 Calcular profundidad acumulada como suma de longitudes de segmentos anteriores
- [ ] 4.3 Agregar fila de bomba si `well.pump !== null` (tipo, profundidad, diámetro)
- [ ] 4.4 Guard: no renderizar si `tubingString.length === 0`
- [ ] 4.5 Respetar toggle `visible.tubingDetail`

## 5. Apilamiento dinámico

- [ ] 5.1 Implementar lógica de apilamiento: cada bloque reporta su altura, el siguiente se posiciona en prevY + prevHeight + GAP(8px)
- [ ] 5.2 Si un bloque está oculto (toggle off), su altura es 0 y el siguiente sube

## 6. Verificación visual

- [ ] 6.1 Verificar los 3 bloques apilados correctamente con los 4 pozos de ejemplo
- [ ] 6.2 Verificar toggles individuales ocultan/muestran cada bloque y los demás se reposicionan
- [ ] 6.3 Verificar en modo horizontal y half-section (bloques fuera del grupo rotado)
