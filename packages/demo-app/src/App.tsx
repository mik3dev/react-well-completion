import { useMemo, useState } from 'react';
import { useWellStore } from './store/well-store';
import { useLabelsStore } from './store/labels-store';
import { buildMockProfiles } from './data/example-wells';
import Toolbar from './components/Toolbar';
import WellSelector from './components/editor/WellSelector';
import WellEditor from './components/editor/WellEditor';
import { WellDiagram, SimplifiedDiagram } from '@mik3dev/react-well-completion';
import './App.css';

export default function App() {
  const well = useWellStore(s => s.wells.find(w => w.id === s.selectedWellId));
  const visible = useLabelsStore(s => s.visible);
  const [showSimplified, setShowSimplified] = useState(false);
  const [showProfiles, setShowProfiles] = useState(true);

  // Synthesize mock profiles spanning the full depth of the selected well, so
  // the curves visually cover the entire depth axis regardless of well depth.
  const profiles = useMemo(
    () => (well ? buildMockProfiles(well.totalDepth) : []),
    [well?.totalDepth],
  );

  return (
    <div className="app">
      <Toolbar
        showSimplified={showSimplified}
        onToggleSimplified={() => setShowSimplified(s => !s)}
        showProfiles={showProfiles}
        onToggleProfiles={() => setShowProfiles(s => !s)}
      />
      <div className="app__body">
        <aside className="app__sidebar">
          <WellSelector />
          <WellEditor />
        </aside>
        <main className="app__diagram">
          {well ? (
            showSimplified
              ? <SimplifiedDiagram well={well} profiles={showProfiles ? profiles : undefined} />
              : <WellDiagram well={well} labels={visible} profiles={showProfiles ? profiles : undefined} />
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
