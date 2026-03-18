## 1. Componente principal

- [x] 1.1 Crear `src/components/simplified-diagram/SimplifiedDiagram.tsx` — contenedor SVG con ResizeObserver, usa `useDiagramConfig` para generar coordenadas
- [x] 1.2 Exportar componente desde `src/components/simplified-diagram/index.ts`

## 2. Layers simplificados

- [x] 2.1 Crear `SimplifiedCasingLayer.tsx` — casings como rectángulos grises con paredes sólidas, zapatas simplificadas (triángulo), conectores entre diámetros
- [x] 2.2 Crear `SimplifiedTubingLayer.tsx` — tubing como líneas verticales grises con conectores en cambios de diámetro
- [x] 2.3 Crear `SimplifiedPerforationLayer.tsx` — líneas horizontales negras cortas a ambos lados del casing más interno, sin distinción shoot/slot
- [x] 2.4 Crear `SimplifiedPackerLayer.tsx` — rectángulos grises oscuros con diagonal hatch entre tubing y casing
- [x] 2.5 Crear `SimplifiedPumpLayer.tsx` — rectángulo negro sólido en profundidad de bomba
- [x] 2.6 Crear `SimplifiedDepthAxis.tsx` — eje vertical con ticks y labels grises

## 3. Integración

- [x] 3.1 Integrar `SimplifiedDiagram` en `App.tsx` como panel lateral opcional junto al diagrama principal
- [x] 3.2 Agregar toggle para mostrar/ocultar el diagrama simplificado

## 4. Verificación

- [ ] 4.1 Verificar con los 4 pozos de ejemplo que el diagrama simplificado muestra correctamente los elementos
- [ ] 4.2 Verificar escala de grises exclusiva (sin colores)
- [ ] 4.3 Verificar que el componente funciona de forma independiente sin TooltipProvider ni SvgDefs
