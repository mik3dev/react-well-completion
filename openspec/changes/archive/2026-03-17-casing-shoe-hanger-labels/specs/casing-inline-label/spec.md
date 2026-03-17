## ADDED Requirements

### Requirement: Casing data model includes weight and grade
The `Casing` interface SHALL include optional fields `weight?: number` (lb/ft) and `grade?: string` (e.g., `'J-55'`, `'N-80'`, `'P-110'`) for use in labels and exports.

#### Scenario: Existing casings without weight/grade remain valid
- **WHEN** a `Casing` object has no `weight` or `grade` set
- **THEN** the diagram renders normally with those fields simply omitted from labels

#### Scenario: New casings can have weight and grade set in editor
- **WHEN** a user fills in weight and grade in the casing editor
- **THEN** those values are stored in the well state and reflected in the diagram

### Requirement: Inline casing label rendered on the diagram body
The system SHALL render a small text label alongside each casing body on the diagram, formatted as `Rev. {diameter}" #{weight} {grade} a {base}'`, omitting absent optional fields.

#### Scenario: Full label with all fields
- **WHEN** a casing has diameter=13.375, weight=68, grade='J-55', base=4023
- **THEN** the label reads: `Rev. 13-3/8" #68 J-55 a 4023'`

#### Scenario: Label with missing weight and grade
- **WHEN** a casing has diameter=7, no weight, no grade, base=900
- **THEN** the label reads: `Rev. 7" a 900'`

#### Scenario: Label positioned near top of casing
- **WHEN** the label is rendered
- **THEN** it appears near the top of the casing body, outside the left wall, anchored to the right
