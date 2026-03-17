## ADDED Requirements

### Requirement: Hanger symbol at top of nested casings
The system SHALL render a hanger (colgador) icon at the top depth of any casing whose `top > 0`, indicating it is suspended inside an outer casing.

#### Scenario: Hanger drawn for liner/lap casing
- **WHEN** a casing has `top > 0`
- **THEN** a horizontal bar with downward flanges is drawn at `depthToY(casing.top)`, spanning slightly wider than the casing wall on each side

#### Scenario: No hanger for surface casing
- **WHEN** a casing has `top === 0`
- **THEN** no hanger icon is rendered (it starts at the wellhead)

#### Scenario: Visual gap in overlap zone
- **WHEN** a hanger is rendered
- **THEN** the inner casing wall begins at the bottom of the hanger icon, creating visible separation from any outer casing at the same depth
