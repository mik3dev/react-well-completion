## ADDED Requirements

### Requirement: Shoot perforations rendered as dense horizontal lines through casing wall
El sistema SHALL representar las perforaciones de tipo `shoot` como una serie de líneas horizontales paralelas que cruzan la pared del casing, extendiéndose hacia afuera en la formación y ligeramente hacia adentro del espacio anular.

#### Scenario: Líneas horizontales proporcionales al diámetro
- **WHEN** se renderiza una perforation de tipo `shoot`
- **THEN** cada línea SHALL arrancar desde `x1 - outerLen` hasta `x1 + innerOverlap` en el lado izquierdo y desde `x2 - innerOverlap` hasta `x2 + outerLen` en el lado derecho, donde `outerLen = pulgada * 0.9` e `innerOverlap = pulgada * 0.2`

#### Scenario: Espaciado proporcional al tamaño del pozo
- **WHEN** se renderiza un intervalo perforado
- **THEN** el número de líneas SHALL ser `max(3, floor(intervalH / max(pulgada * 0.5, 6)))` para garantizar densidad visual proporcional

#### Scenario: Límites del intervalo marcados
- **WHEN** se renderiza cualquier perforation
- **THEN** SHALL dibujarse una línea horizontal en `yTop` y otra en `yBase` con stroke punteado para delimitar el intervalo

#### Scenario: Sin zona coloreada de fondo
- **WHEN** se renderiza una perforation de tipo `shoot`
- **THEN** NOT SHALL renderizarse un `rect` de fondo coloreado dentro del casing (diseño limpio sin relleno)

### Requirement: Slot perforations rendered as horizontal cuts
El sistema SHALL representar las perforaciones de tipo `slot` como cortes horizontales cortos a través de la pared del casing únicamente.

#### Scenario: Cortes de ranura a través de la pared
- **WHEN** se renderiza una perforation de tipo `slot`
- **THEN** cada ranura SHALL renderizarse como una línea que va desde `x1 - slotLen` hasta `x1 + overlap` y desde `x2 - overlap` hasta `x2 + slotLen`, donde `slotLen = pulgada * 0.45`
