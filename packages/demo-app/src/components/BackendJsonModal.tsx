import { useState } from 'react';
import { parseBackendWell } from '@mik3dev/react-well-completion';
import { useWellStore } from '../store/well-store';

interface BackendJsonModalProps {
  open: boolean;
  onClose: () => void;
}

const PLACEHOLDER_JSON = `{
  "variables": {
    "Pozo": "...",
    "HUD": 0,
    "Tipo de Trabajo": "CVGL",
    "Casing": [],
    "Tubing": [],
    ...
  }
}`;

export default function BackendJsonModal({ open, onClose }: BackendJsonModalProps) {
  const appendWell = useWellStore(s => s.appendWell);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleParse = () => {
    setError(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      setError(`JSON invalido: ${e instanceof Error ? e.message : 'error desconocido'}`);
      return;
    }

    // Auto-unwrap if the backend uses a { variables: {...} } envelope
    const source = (parsed['variables'] && typeof parsed['variables'] === 'object')
      ? parsed['variables'] as Record<string, unknown>
      : parsed;

    try {
      const well = parseBackendWell(source);
      appendWell(well);
      setJsonText('');
      onClose();
    } catch (e) {
      setError(`Error al parsear: ${e instanceof Error ? e.message : 'error desconocido'}`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>Importar desde Backend JSON</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <p className="modal__hint">
            Pega aqui la respuesta del backend. Se auto-detecta el envoltorio
            <code>{' { variables: {...} } '}</code>si existe.
          </p>
          <textarea
            className="modal__textarea"
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            placeholder={PLACEHOLDER_JSON}
            spellCheck={false}
          />
          {error && <div className="modal__error">{error}</div>}
        </div>
        <div className="modal__footer">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={handleParse}
            className="modal__primary"
            disabled={!jsonText.trim()}
          >
            Parsear y agregar
          </button>
        </div>
      </div>
    </div>
  );
}
