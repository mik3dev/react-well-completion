import { useMemo, useState } from 'react';
import { useWellStore } from './store/well-store';
import { useLabelsStore } from './store/labels-store';
import { buildMockProfiles } from './data/example-wells';
import Toolbar from './components/Toolbar';
import WellSelector from './components/editor/WellSelector';
import WellEditor from './components/editor/WellEditor';
import { WellDiagram, SimplifiedDiagram } from '@mik3dev/react-well-completion';
import './App.css';

// Visible earth colors when "Formacion" toggle is ON.
// WellDiagram uses the textured pattern (default).
// SimplifiedDiagram uses a flat light gray so it remains schematic-friendly.
const SIMPLIFIED_EARTH_VISIBLE = '#e7e5e4';

export default function App() {
  const well = useWellStore(s => s.wells.find(w => w.id === s.selectedWellId));
  const visible = useLabelsStore(s => s.visible);
  const [showSimplified, setShowSimplified] = useState(false);
  const [showProfiles, setShowProfiles] = useState(true);
  const [showEarth, setShowEarth] = useState(true);

  // Synthesize mock profiles spanning the full depth of the selected well, so
  // the curves visually cover the entire depth axis regardless of well depth.
  const profiles = useMemo(
    () => (well ? buildMockProfiles(well.totalDepth) : []),
    [well?.totalDepth],
  );

  // theme.earthFill is only overridden when the user disables Formacion.
  // When enabled, omitting the key lets the library use its default ('url(#earthFill)').
  const wellTheme = showEarth ? undefined : { earthFill: 'transparent' };
  // SimplifiedDiagram's earthFill default is 'transparent', so the toggle
  // works inverted: ON shows a visible light-gray, OFF (or default) hides.
  const simplifiedEarthFill = showEarth ? SIMPLIFIED_EARTH_VISIBLE : 'transparent';

  return (
    <div className="app">
      <Toolbar
        showSimplified={showSimplified}
        onToggleSimplified={() => setShowSimplified(s => !s)}
        showProfiles={showProfiles}
        onToggleProfiles={() => setShowProfiles(s => !s)}
        showEarth={showEarth}
        onToggleEarth={() => setShowEarth(s => !s)}
      />
      <div className="app__body">
        <aside className="app__sidebar">
          <WellSelector />
          <WellEditor />
        </aside>
        <main className="app__diagram">
          {well ? (
            showSimplified
              ? <SimplifiedDiagram
                  well={well}
                  profiles={showProfiles ? profiles : undefined}
                  earthFill={simplifiedEarthFill}
                />
              : <WellDiagram
                  well={well}
                  labels={visible}
                  profiles={showProfiles ? profiles : undefined}
                  theme={wellTheme}
                />
          ) : (
            <div className="app__placeholder">
              <p>Selecciona o crea un pozo para visualizar el diagrama</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
