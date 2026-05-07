# Profile Panel for WellDiagram

## ¿Por qué?

`openspec/PLAN-diagram-modes.md` definió cuatro secciones: abstracción de coordenadas, half-section, orientación horizontal, y panel de perfiles. Las primeras tres se cerraron en changes anteriores. La cuarta — el panel de perfiles para visualizar registros tipo presión/temperatura junto al diagrama — quedó pendiente. Este change la cierra.

## ¿Qué cambia?

`WellDiagram` acepta tres props nuevos opcionales: `profiles`, `profileLayout`, `profileTrackWidth`. Cuando hay profiles, se renderiza un panel de tracks paralelos (uno por profile) que comparte el eje de profundidad con el diagrama mecánico. Backward-compatible al 100% — sin esos props, render bit-idéntico al actual.

## Alcance

- API pública: tipos `Profile`, `ProfilePoint`, `ProfileLayout` y los nuevos props en `WellDiagramProps`.
- Layout: tracks paralelos en v1; el prop `profileLayout` está preparado para soportar `'overlay'` en el futuro pero solo `'tracks'` es válido en v1.
- Orientación: el panel sigue al diagrama (vertical → derecha; horizontal → debajo).
- Interactividad: tooltip al hover sobre cada punto. Sin crosshair sincronizado.

## Fuera de alcance

- Editor UI (los profiles vienen 100% por props).
- Modo overlay (deferido a v2).
- Crosshair sincronizado entre diagrama y panel.
- Importación de archivos LAS u otros formatos.
- Downsampling para datasets grandes — recomendamos < 500 puntos por profile.
