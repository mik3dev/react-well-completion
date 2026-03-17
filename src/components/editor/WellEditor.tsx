import { useWellStore } from '../../store/well-store';
import type { LiftMethod, DiagramOrientation, HalfSide, Casing, TubingSegment, RodSegment } from '../../types';
import { createCasing, createTubingSegment, createRodSegment, createPump, createSand, createPerforation, createPacker, createSeatNipple, createPlug, createGasAnchor, createMandrel, createSleeve, createPacking, createWire } from '../../utils/well-factory';

const METHODS: { value: LiftMethod; label: string }[] = [
  { value: 'BM', label: 'Bomba Mecánica' },
  { value: 'BCP', label: 'BCP' },
  { value: 'BES', label: 'BES' },
  { value: 'GL', label: 'Gas Lift' },
];

export default function WellEditor() {
  const { getSelectedWell, updateWellMeta, addElement, updateElement, removeElement, setPump, setWire } = useWellStore();
  const well = getSelectedWell();

  if (!well) {
    return <div className="well-editor__empty">Selecciona o crea un pozo para editar</div>;
  }

  return (
    <div className="well-editor">
      {/* General info */}
      <section className="editor-section">
        <h4>Información General</h4>
        <div className="editor-fields">
          <label>
            Nombre
            <input value={well.name} onChange={e => updateWellMeta(well.id, { name: e.target.value })} />
          </label>
          <label>
            Método
            <select value={well.liftMethod} onChange={e => updateWellMeta(well.id, { liftMethod: e.target.value as LiftMethod })}>
              {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>
          <label>
            Prof. Total (ft)
            <input type="number" value={well.totalDepth} onChange={e => updateWellMeta(well.id, { totalDepth: +e.target.value })} />
          </label>
          <label>
            Prof. Libre (ft)
            <input type="number" value={well.totalFreeDepth} onChange={e => updateWellMeta(well.id, { totalFreeDepth: +e.target.value })} />
          </label>
          <label>
            Latitud
            <input type="number" step="0.0001" value={well.latitude ?? ''} placeholder="\u2014"
              onChange={e => updateWellMeta(well.id, { latitude: e.target.value ? +e.target.value : undefined })} />
          </label>
          <label>
            Longitud
            <input type="number" step="0.0001" value={well.longitude ?? ''} placeholder="\u2014"
              onChange={e => updateWellMeta(well.id, { longitude: e.target.value ? +e.target.value : undefined })} />
          </label>
          <label>
            Estacion de Flujo (EF)
            <input value={well.estacionFlujo ?? ''} placeholder="EF-01"
              onChange={e => updateWellMeta(well.id, { estacionFlujo: e.target.value || undefined })} />
          </label>
          <label>
            Mesa Rotaria (ft)
            <input type="number" value={well.mesaRotaria ?? ''} placeholder="\u2014"
              onChange={e => updateWellMeta(well.id, { mesaRotaria: e.target.value ? +e.target.value : undefined })} />
          </label>
          <label>
            Orientación
            <select value={well.orientation ?? 'vertical'} onChange={e => updateWellMeta(well.id, { orientation: e.target.value as DiagramOrientation })}>
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </label>
          <label>
            Media Sección
            <input type="checkbox" checked={well.halfSection ?? false}
              onChange={e => updateWellMeta(well.id, { halfSection: e.target.checked })} />
          </label>
          {well.halfSection && (
            <label>
              Lado
              <select value={well.halfSide ?? 'right'} onChange={e => updateWellMeta(well.id, { halfSide: e.target.value as HalfSide })}>
                <option value="right">Derecha</option>
                <option value="left">Izquierda</option>
              </select>
            </label>
          )}
        </div>
      </section>

      {/* Casings */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Casings / Revestidores</h4>
          <button onClick={() => addElement('casings', createCasing({ diameter: 7, top: 0, base: 1000, isLiner: false }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead>
            <tr><th>Diám.</th><th>Tope</th><th>Base</th><th>Liner</th><th>Peso (lb/ft)</th><th>Grado</th><th></th></tr>
          </thead>
          <tbody>
            {well.casings.map((c: Casing) => (
              <tr key={c.id}>
                <td><input type="number" step="0.5" value={c.diameter} onChange={e => updateElement('casings', c.id, { diameter: +e.target.value })} /></td>
                <td><input type="number" value={c.top} onChange={e => updateElement('casings', c.id, { top: +e.target.value })} /></td>
                <td><input type="number" value={c.base} onChange={e => updateElement('casings', c.id, { base: +e.target.value })} /></td>
                <td><input type="checkbox" checked={c.isLiner} onChange={e => updateElement('casings', c.id, { isLiner: e.target.checked })} /></td>
                <td><input type="number" step="0.1" value={c.weight ?? ''} placeholder="—" onChange={e => updateElement('casings', c.id, { weight: e.target.value ? +e.target.value : undefined })} /></td>
                <td><input type="text" value={c.grade ?? ''} placeholder="J-55" onChange={e => updateElement('casings', c.id, { grade: e.target.value || undefined })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('casings', c.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tubing */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Tubing / Tubería</h4>
          <button onClick={() => addElement('tubingString', createTubingSegment({ segment: well.tubingString.length + 1, diameter: 3.5, length: 500 }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead>
            <tr><th>#</th><th>Diám.</th><th>Long.</th><th></th></tr>
          </thead>
          <tbody>
            {well.tubingString.map((t: TubingSegment) => (
              <tr key={t.id}>
                <td><input type="number" value={t.segment} onChange={e => updateElement('tubingString', t.id, { segment: +e.target.value })} /></td>
                <td><input type="number" step="0.5" value={t.diameter} onChange={e => updateElement('tubingString', t.id, { diameter: +e.target.value })} /></td>
                <td><input type="number" value={t.length} onChange={e => updateElement('tubingString', t.id, { length: +e.target.value })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('tubingString', t.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Rods (only BM/BCP) */}
      {(well.liftMethod === 'BM' || well.liftMethod === 'BCP') && (
        <section className="editor-section">
          <div className="editor-section__header">
            <h4>Cabillas / Rods</h4>
            <button onClick={() => addElement('rodString', createRodSegment({ segment: well.rodString.length + 1, diameter: 0.875, length: 500 }))}>+ Agregar</button>
          </div>
          <table className="editor-table">
            <thead>
              <tr><th>#</th><th>Diám.</th><th>Long.</th><th></th></tr>
            </thead>
            <tbody>
              {well.rodString.map((r: RodSegment) => (
                <tr key={r.id}>
                  <td><input type="number" value={r.segment} onChange={e => updateElement('rodString', r.id, { segment: +e.target.value })} /></td>
                  <td><input type="number" step="0.125" value={r.diameter} onChange={e => updateElement('rodString', r.id, { diameter: +e.target.value })} /></td>
                  <td><input type="number" value={r.length} onChange={e => updateElement('rodString', r.id, { length: +e.target.value })} /></td>
                  <td><button className="btn-delete" onClick={() => removeElement('rodString', r.id)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Pump */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Bomba</h4>
          {!well.pump && (
            <button onClick={() => setPump(createPump({ type: well.liftMethod, depth: 1000, diameter: 2.5, length: 50 }))}>+ Agregar</button>
          )}
        </div>
        {well.pump && (
          <div className="editor-fields">
            <label>
              Prof. (ft)
              <input type="number" value={well.pump.depth} onChange={e => setPump({ ...well.pump!, depth: +e.target.value })} />
            </label>
            <label>
              Diám.
              <input type="number" step="0.5" value={well.pump.diameter} onChange={e => setPump({ ...well.pump!, diameter: +e.target.value })} />
            </label>
            <label>
              Long. (ft)
              <input type="number" value={well.pump.length} onChange={e => setPump({ ...well.pump!, length: +e.target.value })} />
            </label>
            <button className="btn-delete" onClick={() => setPump(null)}>Eliminar bomba</button>
          </div>
        )}
      </section>

      {/* Sands */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Arenas / Formaciones</h4>
          <button onClick={() => {
            const seg = well.sands.length + 1;
            const name = `Arena ${String.fromCharCode(64 + seg)}`;
            addElement('sands', createSand({ name, segment: seg, top: 0, base: 500 }));
          }}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead>
            <tr><th>Nombre</th><th>Tope</th><th>Base</th><th></th></tr>
          </thead>
          <tbody>
            {well.sands.map(s => (
              <tr key={s.id}>
                <td><input value={s.name} onChange={e => updateElement('sands', s.id, { name: e.target.value })} /></td>
                <td><input type="number" value={s.top} onChange={e => updateElement('sands', s.id, { top: +e.target.value })} /></td>
                <td><input type="number" value={s.base} onChange={e => updateElement('sands', s.id, { base: +e.target.value })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('sands', s.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Perforations */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Perforaciones</h4>
          <button onClick={() => addElement('perforations', createPerforation({ top: 0, base: 100, type: 'shoot' }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead>
            <tr><th>Tope</th><th>Base</th><th>Tipo</th><th>Yacimiento</th><th>Arena</th><th></th></tr>
          </thead>
          <tbody>
            {well.perforations.map(p => (
              <tr key={p.id}>
                <td><input type="number" value={p.top} onChange={e => updateElement('perforations', p.id, { top: +e.target.value })} /></td>
                <td><input type="number" value={p.base} onChange={e => updateElement('perforations', p.id, { base: +e.target.value })} /></td>
                <td>
                  <select value={p.type} onChange={e => updateElement('perforations', p.id, { type: e.target.value as 'slot' | 'shoot' })}>
                    <option value="shoot">Cañoneo</option>
                    <option value="slot">Ranurado</option>
                  </select>
                </td>
                <td><input value={p.yacimiento ?? ''} placeholder="Yacimiento" onChange={e => updateElement('perforations', p.id, { yacimiento: e.target.value || undefined })} /></td>
                <td><input value={p.arena ?? ''} placeholder="Arena" onChange={e => updateElement('perforations', p.id, { arena: e.target.value || undefined })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('perforations', p.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Packers */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Packers</h4>
          <button onClick={() => addElement('packers', createPacker({ depth: 1000, diameter: 4 }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead><tr><th>Prof.</th><th>Diám.</th><th></th></tr></thead>
          <tbody>
            {well.packers.map(p => (
              <tr key={p.id}>
                <td><input type="number" value={p.depth} onChange={e => updateElement('packers', p.id, { depth: +e.target.value })} /></td>
                <td><input type="number" step="0.5" value={p.diameter} onChange={e => updateElement('packers', p.id, { diameter: +e.target.value })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('packers', p.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Seat Nipples */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Niples de Asiento</h4>
          <button onClick={() => addElement('seatNipples', createSeatNipple({ depth: 1000, diameter: 1, od: 6, type: 'regular' }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead><tr><th>Prof.</th><th>Diám.</th><th>Tipo</th><th></th></tr></thead>
          <tbody>
            {well.seatNipples.map(n => (
              <tr key={n.id}>
                <td><input type="number" value={n.depth} onChange={e => updateElement('seatNipples', n.id, { depth: +e.target.value })} /></td>
                <td><input type="number" step="0.5" value={n.diameter} onChange={e => updateElement('seatNipples', n.id, { diameter: +e.target.value })} /></td>
                <td>
                  <select value={n.type} onChange={e => updateElement('seatNipples', n.id, { type: e.target.value as 'regular' | 'polished' })}>
                    <option value="regular">Regular</option>
                    <option value="polished">Pulido</option>
                  </select>
                </td>
                <td><button className="btn-delete" onClick={() => removeElement('seatNipples', n.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Plugs */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Tapones</h4>
          <button onClick={() => addElement('plugs', createPlug({ depth: 1000 }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead><tr><th>Prof.</th><th></th></tr></thead>
          <tbody>
            {well.plugs.map(p => (
              <tr key={p.id}>
                <td><input type="number" value={p.depth} onChange={e => updateElement('plugs', p.id, { depth: +e.target.value })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('plugs', p.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Gas Anchors */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Anclas de Gas</h4>
          <button onClick={() => addElement('gasAnchors', createGasAnchor({ depth: 1000, diameter: 3, length: 50 }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead><tr><th>Prof.</th><th>Diám.</th><th>Long.</th><th></th></tr></thead>
          <tbody>
            {well.gasAnchors.map(g => (
              <tr key={g.id}>
                <td><input type="number" value={g.depth} onChange={e => updateElement('gasAnchors', g.id, { depth: +e.target.value })} /></td>
                <td><input type="number" step="0.5" value={g.diameter} onChange={e => updateElement('gasAnchors', g.id, { diameter: +e.target.value })} /></td>
                <td><input type="number" value={g.length} onChange={e => updateElement('gasAnchors', g.id, { length: +e.target.value })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('gasAnchors', g.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Gas Lift Mandrels (only GL) */}
      {well.liftMethod === 'GL' && (
        <section className="editor-section">
          <div className="editor-section__header">
            <h4>Mandriles GL</h4>
            <button onClick={() => addElement('mandrels', createMandrel({ segment: well.mandrels.length + 1, depth: 1000, diameter: 4, hasValve: false }))}>+ Agregar</button>
          </div>
          <table className="editor-table">
            <thead><tr><th>#</th><th>Prof.</th><th>Diám.</th><th>Válvula</th><th></th></tr></thead>
            <tbody>
              {well.mandrels.map(m => (
                <tr key={m.id}>
                  <td><input type="number" value={m.segment} onChange={e => updateElement('mandrels', m.id, { segment: +e.target.value })} /></td>
                  <td><input type="number" value={m.depth} onChange={e => updateElement('mandrels', m.id, { depth: +e.target.value })} /></td>
                  <td><input type="number" step="0.5" value={m.diameter} onChange={e => updateElement('mandrels', m.id, { diameter: +e.target.value })} /></td>
                  <td><input type="checkbox" checked={m.hasValve} onChange={e => updateElement('mandrels', m.id, { hasValve: e.target.checked })} /></td>
                  <td><button className="btn-delete" onClick={() => removeElement('mandrels', m.id)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Sleeves */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Mangas</h4>
          <button onClick={() => addElement('sleeves', createSleeve({ depth: 1000, diameter: 4 }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead><tr><th>Prof.</th><th>Diám.</th><th></th></tr></thead>
          <tbody>
            {well.sleeves.map(s => (
              <tr key={s.id}>
                <td><input type="number" value={s.depth} onChange={e => updateElement('sleeves', s.id, { depth: +e.target.value })} /></td>
                <td><input type="number" step="0.5" value={s.diameter} onChange={e => updateElement('sleeves', s.id, { diameter: +e.target.value })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('sleeves', s.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Packings */}
      <section className="editor-section">
        <div className="editor-section__header">
          <h4>Empacaduras</h4>
          <button onClick={() => addElement('packings', createPacking({ depth: 1000, diameter: 3, od: 6 }))}>+ Agregar</button>
        </div>
        <table className="editor-table">
          <thead><tr><th>Prof.</th><th>Diám.</th><th></th></tr></thead>
          <tbody>
            {well.packings.map(p => (
              <tr key={p.id}>
                <td><input type="number" value={p.depth} onChange={e => updateElement('packings', p.id, { depth: +e.target.value })} /></td>
                <td><input type="number" step="0.5" value={p.diameter} onChange={e => updateElement('packings', p.id, { diameter: +e.target.value })} /></td>
                <td><button className="btn-delete" onClick={() => removeElement('packings', p.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* BES Wire */}
      {well.liftMethod === 'BES' && (
        <section className="editor-section">
          <div className="editor-section__header">
            <h4>Cable BES</h4>
            {!well.wire && <button onClick={() => setWire(createWire({ depth: 5000 }))}>+ Agregar</button>}
          </div>
          {well.wire && (
            <div className="editor-fields">
              <label>
                Prof. (ft)
                <input type="number" value={well.wire.depth} onChange={e => setWire({ ...well.wire!, depth: +e.target.value })} />
              </label>
              <button className="btn-delete" onClick={() => setWire(null)}>Eliminar</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
