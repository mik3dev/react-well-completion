## 1. Implementación

- [ ] 1.1 Detectar `isH` en SimplifiedDiagram y swap dimensiones para config (`configW = size.height - margin`, `configH = size.width - margin`)
- [ ] 1.2 Aplicar transform de rotación al grupo principal: `translate(35, ${20 + config.width}) rotate(-90)` cuando isH
- [ ] 1.3 Renderizar SimplifiedDepthAxis dentro del grupo solo cuando !isH
- [ ] 1.4 Renderizar eje de profundidad horizontal fuera del grupo cuando isH (ticks mapeados a screen X)

## 2. Verificación

- [ ] 2.1 Verificar diagrama simplificado vertical sigue funcionando sin cambios
- [ ] 2.2 Verificar diagrama simplificado horizontal con los 4 pozos de ejemplo
