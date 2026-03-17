## ADDED Requirements

### Requirement: Casing shoe rendered as outward-pointing triangle
The system SHALL render a filled triangular shoe at the base of each casing wall, pointing outward (away from centerline), replacing the current polygon with cement circle icon.

#### Scenario: Left shoe points to the left
- **WHEN** rendering the shoe for the left wall of a casing
- **THEN** a filled dark triangle is drawn with its apex at the outer-left edge and its base at the top of the shoe area

#### Scenario: Right shoe points to the right
- **WHEN** rendering the shoe for the right wall of a casing
- **THEN** a filled dark triangle is drawn with its apex at the outer-right edge, mirroring the left

#### Scenario: Shoe dimensions proportional to wall thickness
- **WHEN** the diagram is rendered at any zoom level
- **THEN** shoe height is approximately 3× the wall thickness (WALL constant)
