## 1. Infraestructura

- [x] 1.1 Adaptar `WellDiagram.tsx`: swap dimensions for horizontal, apply `rotate(-90)` transform, move WellDetailLayer outside rotated group
- [x] 1.2 Adaptar `useDiagramConfig`: simplify to always generate vertical coords (rotation handles axis swap)

## 2. Eje de profundidad

- [x] 2.1 Adaptar **DepthAxisLayer**: counter-rotate text labels with `rotate(90)` in horizontal mode

## 3. Layers estructurales

- [x] 3.1 Adaptar **CasingLayer**: counter-rotate inline labels in horizontal mode
- [x] 3.2 **TubingLayer**: works via rotation (no changes needed)
- [x] 3.3 **RodLayer**: works via rotation (no changes needed)
- [x] 3.4 **PumpLayer**: works via rotation (no changes needed)
- [x] 3.5 **WireLayer**: works via rotation (no changes needed)

## 4. Layers de relleno

- [x] 4.1 **SandLayer**: works via rotation (no changes needed)
- [x] 4.2 **EarthLayer**: works via rotation (no changes needed)

## 5. Perforaciones y accesorios

- [x] 5.1 **PerforationLayer**: works via rotation (no changes needed)
- [x] 5.2 **AccessoriesLayer**: works via rotation (no changes needed)

## 6. Labels

- [x] 6.1 Adaptar **LabelsLayer**: add `rotate` prop to Label component, counter-rotate all labels in horizontal mode
- [x] 6.2 Adaptar **WellDetailLayer**: rendered outside rotated group with original container dimensions

## 7. Verificación

- [x] 7.1 Verificar build sin errores TypeScript (`npm run build`)
- [ ] 7.2 Verificar visualmente horizontal con pozo GL
- [ ] 7.3 Verificar horizontal + half-section combinados
- [ ] 7.4 Verificar que vertical sigue sin regresiones
