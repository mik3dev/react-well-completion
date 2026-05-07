# Design

El diseño detallado vive en [`docs/superpowers/specs/2026-05-06-profile-panel-design.md`](../../../docs/superpowers/specs/2026-05-06-profile-panel-design.md).

Resumen de decisiones cerradas durante el brainstorming:

1. **Alcance**: extensión del componente `WellDiagram` existente (no se exporta un nuevo componente).
2. **Layout**: tracks paralelos (estándar de well-log software). `profileLayout` extensible para `'overlay'` en v2.
3. **API shape**: `name` y `unit` requeridos; `color` y `scale` opcionales. Paleta automática como fallback.
4. **Orientación**: panel "sigue" al diagrama — vertical→derecha, horizontal→debajo.
5. **Interactividad**: tooltip simple al hover. Sin crosshair sincronizado.
6. **Versionado**: bump minor (0.1.x → 0.2.0). API pública aditiva, no breaking.
