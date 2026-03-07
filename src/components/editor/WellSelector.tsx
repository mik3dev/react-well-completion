import { useState } from 'react';
import { useWellStore } from '../../store/well-store';
import type { LiftMethod } from '../../types';

const METHODS: { value: LiftMethod; label: string }[] = [
  { value: 'BM', label: 'Bomba Mecánica' },
  { value: 'BCP', label: 'BCP' },
  { value: 'BES', label: 'BES' },
  { value: 'GL', label: 'Gas Lift' },
];

export default function WellSelector() {
  const { wells, selectedWellId, selectWell, addWell, removeWell } = useWellStore();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMethod, setNewMethod] = useState<LiftMethod>('BM');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addWell(newName.trim(), newMethod);
    setNewName('');
    setShowNew(false);
  };

  return (
    <div className="well-selector">
      <div className="well-selector__header">
        <h3>Pozos</h3>
        <button onClick={() => setShowNew(!showNew)} title="Nuevo pozo">+</button>
      </div>

      {showNew && (
        <div className="well-selector__new">
          <input
            placeholder="Nombre del pozo"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <select value={newMethod} onChange={e => setNewMethod(e.target.value as LiftMethod)}>
            {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={handleAdd}>Crear</button>
        </div>
      )}

      <ul className="well-selector__list">
        {wells.map(w => (
          <li
            key={w.id}
            className={w.id === selectedWellId ? 'active' : ''}
            onClick={() => selectWell(w.id)}
          >
            <span>{w.name}</span>
            <span className="well-selector__method">{w.liftMethod}</span>
            <button
              className="well-selector__delete"
              onClick={e => { e.stopPropagation(); removeWell(w.id); }}
              title="Eliminar"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
