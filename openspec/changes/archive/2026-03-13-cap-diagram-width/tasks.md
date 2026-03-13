## 1. Implementar cap de ancho efectivo

- [x] 1.1 Agregar constante `MAX_DIAGRAM_WIDTH = 480` en `src/hooks/use-diagram-config.ts`
- [x] 1.2 Calcular `effectiveWidth = Math.min(width, MAX_DIAGRAM_WIDTH)` antes de `pulgada`
- [x] 1.3 Cambiar `pulgada = width / DIAMETER_SCALE` a `pulgada = effectiveWidth / DIAMETER_SCALE`
- [x] 1.4 Verificar que `centerX` sigue siendo `width / 2` (sin cambio)

## 2. Verificación

- [x] 2.1 Confirmar build limpio (`npm run build`)
- [x] 2.2 Revisar visualmente en viewport ancho que la bomba y casings tienen tamaño razonable
