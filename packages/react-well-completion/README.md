# react-well-completion

React components for rendering oil & gas well completion diagrams as SVG.

## Installation

```bash
npm install react-well-completion
```

## Usage

```tsx
import { WellDiagram, createWell } from 'react-well-completion';

const well = createWell('Pozo-001', 'BM');

function App() {
  return <WellDiagram well={well} />;
}
```

### Simplified Diagram

```tsx
import { SimplifiedDiagram } from 'react-well-completion';

function App({ well }) {
  return <SimplifiedDiagram well={well} />;
}
```

### Controlling Label Visibility

```tsx
<WellDiagram
  well={well}
  labels={{
    casings: true,
    tubing: true,
    wellDetail: false,
    casingDetail: false,
  }}
/>
```

### Custom Theme

```tsx
<WellDiagram
  well={well}
  theme={{
    headerBg: '#1a1a2e',
    accent: '#e94560',
    headerText: '#ffffff',
  }}
/>
```

## API

### Components

| Component | Props | Description |
|---|---|---|
| `WellDiagram` | `well`, `labels?`, `theme?` | Full detailed diagram with labels and detail blocks |
| `SimplifiedDiagram` | `well` | Grayscale schematic diagram |

### Factory Functions

`createWell`, `createCasing`, `createTubingSegment`, `createPump`, `createPacker`, etc.

### Types

`Well`, `Casing`, `TubingSegment`, `Pump`, `LabelCategory`, `BrandTheme`, `DiagramConfig`, etc.

## License

MIT
