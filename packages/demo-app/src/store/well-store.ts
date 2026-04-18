import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Well, Pump, Wire, LiftMethod } from '@mik3dev/react-well-completion';
import { createWell } from '@mik3dev/react-well-completion';

interface WellStore {
  wells: Well[];
  selectedWellId: string | null;

  // Well CRUD
  addWell: (name: string, liftMethod: LiftMethod) => void;
  removeWell: (id: string) => void;
  selectWell: (id: string) => void;
  updateWellMeta: (id: string, data: Partial<Pick<Well, 'name' | 'totalDepth' | 'totalFreeDepth' | 'liftMethod' | 'latitude' | 'longitude' | 'estacionFlujo' | 'mesaRotaria' | 'orientation' | 'halfSection' | 'halfSide'>>) => void;

  // Generic element operations on the selected well
  addElement: <K extends keyof Well>(field: K, element: Well[K] extends Array<infer T> ? T : never) => void;
  updateElement: <K extends keyof Well>(field: K, elementId: string, data: Partial<Well[K] extends Array<infer T> ? T : never>) => void;
  removeElement: <K extends keyof Well>(field: K, elementId: string) => void;

  // Singular element setters (pump, wire)
  setPump: (pump: Pump | null) => void;
  setWire: (wire: Wire | null) => void;

  // Computed
  getSelectedWell: () => Well | undefined;

  // Import/Export
  importWells: (wells: Well[]) => void;
  appendWell: (well: Well) => void;
  exportWells: () => Well[];
}

const updateWellInList = (wells: Well[], id: string, updater: (w: Well) => Well): Well[] =>
  wells.map(w => w.id === id ? updater(w) : w);

export const useWellStore = create<WellStore>()(
  persist(
    (set, get) => ({
      wells: [],
      selectedWellId: null,

      addWell: (name, liftMethod) => {
        const well = createWell(name, liftMethod);
        set(s => ({ wells: [...s.wells, well], selectedWellId: well.id }));
      },

      removeWell: (id) => set(s => ({
        wells: s.wells.filter(w => w.id !== id),
        selectedWellId: s.selectedWellId === id ? null : s.selectedWellId,
      })),

      selectWell: (id) => set({ selectedWellId: id }),

      updateWellMeta: (id, data) => set(s => ({
        wells: updateWellInList(s.wells, id, w => ({ ...w, ...data })),
      })),

      addElement: (field, element) => {
        const { selectedWellId } = get();
        if (!selectedWellId) return;
        set(s => ({
          wells: updateWellInList(s.wells, selectedWellId, w => ({
            ...w,
            [field]: [...(w[field] as unknown[]), element],
          })),
        }));
      },

      updateElement: (field, elementId, data) => {
        const { selectedWellId } = get();
        if (!selectedWellId) return;
        set(s => ({
          wells: updateWellInList(s.wells, selectedWellId, w => ({
            ...w,
            [field]: (w[field] as Array<{ id: string }>).map(el =>
              el.id === elementId ? { ...el, ...data } : el
            ),
          })),
        }));
      },

      removeElement: (field, elementId) => {
        const { selectedWellId } = get();
        if (!selectedWellId) return;
        set(s => ({
          wells: updateWellInList(s.wells, selectedWellId, w => ({
            ...w,
            [field]: (w[field] as Array<{ id: string }>).filter(el => el.id !== elementId),
          })),
        }));
      },

      setPump: (pump) => {
        const { selectedWellId } = get();
        if (!selectedWellId) return;
        set(s => ({
          wells: updateWellInList(s.wells, selectedWellId, w => ({ ...w, pump })),
        }));
      },

      setWire: (wire) => {
        const { selectedWellId } = get();
        if (!selectedWellId) return;
        set(s => ({
          wells: updateWellInList(s.wells, selectedWellId, w => ({ ...w, wire })),
        }));
      },

      getSelectedWell: () => {
        const { wells, selectedWellId } = get();
        return wells.find(w => w.id === selectedWellId);
      },

      importWells: (wells) => set({
        wells,
        selectedWellId: wells.length > 0 ? wells[0].id : null,
      }),

      appendWell: (well) => set(s => ({
        wells: [...s.wells, well],
        selectedWellId: well.id,
      })),

      exportWells: () => get().wells,
    }),
    {
      name: 'well-completion-storage',
    }
  )
);
