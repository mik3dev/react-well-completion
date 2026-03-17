## 1. Infraestructura

- [ ] 1.1 Adaptar `WellDiagram.tsx`: cambiar translate a `(0, 30)` en horizontal, pasar config a depth axis
- [ ] 1.2 Adaptar `SvgDefs.tsx`: agregar variantes de patterns rotados para horizontal o usar patternTransform

## 2. Eje de profundidad

- [ ] 2.1 Adaptar **DepthAxisLayer**: eje horizontal arriba con ticks verticales, labels horizontales, grid lines verticales

## 3. Layers estructurales

- [ ] 3.1 Adaptar **CasingLayer**: paredes horizontales (rect rotado), shoes apuntando a la derecha, hangers al inicio, inline labels
- [ ] 3.2 Adaptar **TubingLayer**: líneas horizontales con conectores verticales en cambios de diámetro
- [ ] 3.3 Adaptar **RodLayer**: rectángulos horizontales centrados en centerLine
- [ ] 3.4 Adaptar **PumpLayer**: icono orientado horizontalmente (swap width/height)
- [ ] 3.5 Adaptar **WireLayer**: cable horizontal (si aplica BES)

## 4. Layers de relleno

- [ ] 4.1 Adaptar **SandLayer**: rects horizontales (x=depthToPos, width=depthRange, arriba/abajo del casing)
- [ ] 4.2 Adaptar **EarthLayer**: rect horizontal dentro del casing

## 5. Perforaciones y accesorios

- [ ] 5.1 Adaptar **PerforationLayer**: líneas verticales (perpendiculares al eje horizontal)
- [ ] 5.2 Adaptar **AccessoriesLayer**: todos los accesorios en orientación horizontal

## 6. Labels

- [ ] 6.1 Adaptar **LabelsLayer**: labels posicionados arriba/abajo con texto horizontal
- [ ] 6.2 Adaptar **WellDetailLayer**: reposicionar si colisiona en horizontal

## 7. Verificación

- [ ] 7.1 Verificar build sin errores TypeScript (`npm run build`)
- [ ] 7.2 Verificar visualmente horizontal con pozo GL
- [ ] 7.3 Verificar horizontal + half-section combinados
- [ ] 7.4 Verificar que vertical sigue sin regresiones
