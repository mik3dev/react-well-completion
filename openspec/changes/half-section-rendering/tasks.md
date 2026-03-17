## 1. Línea de eje central

- [x] 1.1 Agregar línea dashed en `centerLine` en `WellDiagram.tsx` cuando `halfSection === true`

## 2. Layers principales

- [x] 2.1 Adaptar **CasingLayer**: una sola pared (lado visible) + medio shoe + medio hanger en half-section
- [x] 2.2 Adaptar **TubingLayer**: una sola línea de pared del lado visible, conectores de un solo lado
- [x] 2.3 Adaptar **RodLayer**: rectángulo desde centerLine al borde del lado visible
- [x] 2.4 Adaptar **PumpLayer**: icono desde centerLine con mitad del ancho
- [x] 2.5 Adaptar **WireLayer**: solo renderizar si el cable está del lado visible

## 3. Layers de relleno

- [x] 3.1 Adaptar **SandLayer**: rects desde centerLine al lado visible
- [x] 3.2 Adaptar **EarthLayer**: rect desde centerLine al lado visible (diameterToX ya maneja half-section)

## 4. Perforaciones y accesorios

- [x] 4.1 Adaptar **PerforationLayer**: perforaciones solo hacia el lado visible
- [x] 4.2 Adaptar **AccessoriesLayer**: packers, nipples, plugs, gas anchors, sleeves, packings, mandrels — solo lado visible

## 5. Labels y detalle

- [x] 5.1 Adaptar **LabelsLayer**: posicionar labels en el lado visible (diameterToX ya maneja positions)
- [x] 5.2 **DepthAxisLayer**: sin cambios necesarios (siempre al lado del eje)
- [x] 5.3 **WellDetailLayer**: sin cambios necesarios (posición fija top-right)

## 6. Verificación

- [x] 6.1 Verificar build sin errores TypeScript (`npm run build`)
- [ ] 6.2 Verificar visualmente half-section derecha con pozo GL
- [ ] 6.3 Verificar visualmente half-section izquierda
- [ ] 6.4 Verificar que full-section sigue sin regresiones
