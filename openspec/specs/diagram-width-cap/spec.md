## ADDED Requirements

### Requirement: Diagram element widths are bounded by a maximum effective width
The system SHALL compute `pulgada` (px per inch of diameter) using `Math.min(containerWidth, MAX_DIAGRAM_WIDTH) / DIAMETER_SCALE` where `MAX_DIAGRAM_WIDTH = 480`. This ensures that no matter how wide the viewport is, diagram elements never exceed the size they would have at 480px container width.

#### Scenario: Wide viewport does not enlarge elements beyond cap
- **WHEN** the SVG container width exceeds 480px
- **THEN** `pulgada` is computed as `480 / 40 = 12` (not `containerWidth / 40`)

#### Scenario: Narrow viewport still scales elements down
- **WHEN** the SVG container width is less than 480px
- **THEN** `pulgada` is computed as `containerWidth / 40` (normal scaling, unaffected)

#### Scenario: Diagram remains centered on wide viewports
- **WHEN** the SVG container width exceeds 480px
- **THEN** `centerX` remains `containerWidth / 2` so the diagram is horizontally centered and labels have extra horizontal space
