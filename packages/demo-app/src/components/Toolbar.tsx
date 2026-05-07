import { useState } from 'react';
import { useExport } from '../hooks/use-export';
import { useWellStore } from '../store/well-store';
import { exampleWells } from '../data/example-wells';
import { useLabelsStore, LABEL_CATEGORIES } from '../store/labels-store';
import BackendJsonModal from './BackendJsonModal';

interface ToolbarProps {
  showSimplified: boolean;
  onToggleSimplified: () => void;
  showProfiles: boolean;
  onToggleProfiles: () => void;
}

export default function Toolbar({
  showSimplified,
  onToggleSimplified,
  showProfiles,
  onToggleProfiles,
}: ToolbarProps) {
  const { exportPng, exportSvg, copyToClipboard } = useExport();
  const { importWells, exportWells, wells } = useWellStore();
  const { visible, toggle, showAll, hideAll } = useLabelsStore();
  const [showLabelsMenu, setShowLabelsMenu] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const anyVisible = Object.values(visible).some(Boolean);

  const handleExportJson = () => {
    const data = JSON.stringify(exportWells(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'wells.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImportJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      importWells(data);
    };
    input.click();
  };

  const handleLoadExamples = () => {
    importWells(exampleWells);
  };

  return (
    <div className="toolbar">
      <h2>Well Completion Diagram</h2>
      <div className="toolbar__actions">
        {wells.length === 0 && (
          <button onClick={handleLoadExamples}>Cargar Ejemplos</button>
        )}
        <button onClick={handleImportJson}>Importar JSON</button>
        <button onClick={() => setShowBackendModal(true)}>Importar Backend JSON</button>
        <button onClick={handleExportJson} disabled={wells.length === 0}>Exportar JSON</button>
        <button onClick={exportPng} disabled={wells.length === 0}>Exportar PNG</button>
        <button onClick={exportSvg} disabled={wells.length === 0}>Exportar SVG</button>
        <button onClick={copyToClipboard} disabled={wells.length === 0}>Copiar Imagen</button>
        <button
          onClick={onToggleSimplified}
          className={showSimplified ? 'active' : ''}
        >
          Simplificado
        </button>
        <button
          onClick={onToggleProfiles}
          className={showProfiles ? 'active' : ''}
        >
          Perfiles
        </button>
        <div className="toolbar__labels-wrapper">
          <button
            onClick={() => setShowLabelsMenu(!showLabelsMenu)}
            className={anyVisible ? 'active' : ''}
          >
            Etiquetas ▾
          </button>
          {showLabelsMenu && (
            <div className="toolbar__labels-menu">
              <div className="toolbar__labels-actions">
                <button onClick={showAll}>Mostrar todas</button>
                <button onClick={hideAll}>Ocultar todas</button>
              </div>
              {LABEL_CATEGORIES.map(cat => (
                <label key={cat.key} className="toolbar__labels-item">
                  <input
                    type="checkbox"
                    checked={visible[cat.key]}
                    onChange={() => toggle(cat.key)}
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <BackendJsonModal open={showBackendModal} onClose={() => setShowBackendModal(false)} />
    </div>
  );
}
