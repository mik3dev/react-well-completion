import { useState } from 'react';
import { useWellStore } from './store/well-store';
import { useLabelsStore } from './store/labels-store';
import Toolbar from './components/Toolbar';
import WellSelector from './components/editor/WellSelector';
import WellEditor from './components/editor/WellEditor';
import WellDiagram from './components/diagram/WellDiagram';
import { SimplifiedDiagram } from './components/simplified-diagram';
import './App.css';

export default function App() {
  const well = useWellStore(s => s.wells.find(w => w.id === s.selectedWellId));
  const visible = useLabelsStore(s => s.visible);
  const [showSimplified, setShowSimplified] = useState(false);

  return (
    <div className="app">
      <Toolbar showSimplified={showSimplified} onToggleSimplified={() => setShowSimplified(s => !s)} />
      <div className="app__body">
        <aside className="app__sidebar">
          <WellSelector />
          <WellEditor />
        </aside>
        <main className="app__diagram">
          {well ? (
            showSimplified ? <SimplifiedDiagram well={well} /> : <WellDiagram well={well} labels={visible} />
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
