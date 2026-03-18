import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LabelCategory =
  | 'casings'
  | 'tubing'
  | 'rods'
  | 'pump'
  | 'perforations'
  | 'sands'
  | 'packers'
  | 'nipples'
  | 'mandrels'
  | 'depths'
  | 'yacimientos'
  | 'wellDetail'
  | 'casingDetail'
  | 'tubingDetail';

export const LABEL_CATEGORIES: { key: LabelCategory; label: string }[] = [
  { key: 'casings', label: 'Casings' },
  { key: 'tubing', label: 'Tubing' },
  { key: 'rods', label: 'Cabillas' },
  { key: 'pump', label: 'Bomba' },
  { key: 'perforations', label: 'Perforaciones' },
  { key: 'sands', label: 'Arenas' },
  { key: 'packers', label: 'Packers' },
  { key: 'nipples', label: 'Niples' },
  { key: 'mandrels', label: 'Mandriles GL' },
  { key: 'depths', label: 'Profundidades' },
  { key: 'yacimientos', label: 'Yacimientos' },
  { key: 'wellDetail', label: 'Detalle de Pozo' },
  { key: 'casingDetail', label: 'Detalle de Casing' },
  { key: 'tubingDetail', label: 'Detalle de Tuberías' },
];

interface LabelsStore {
  visible: Record<LabelCategory, boolean>;
  toggle: (category: LabelCategory) => void;
  showAll: () => void;
  hideAll: () => void;
}

const allVisible = (): Record<LabelCategory, boolean> =>
  Object.fromEntries(LABEL_CATEGORIES.map(c => [c.key, false])) as Record<LabelCategory, boolean>;

export const useLabelsStore = create<LabelsStore>()(
  persist(
    (set) => ({
      visible: allVisible(),

      toggle: (category) => set(s => ({
        visible: { ...s.visible, [category]: !s.visible[category] },
      })),

      showAll: () => set({
        visible: Object.fromEntries(LABEL_CATEGORIES.map(c => [c.key, true])) as Record<LabelCategory, boolean>,
      }),

      hideAll: () => set({ visible: allVisible() }),
    }),
    { name: 'well-labels-visibility' }
  )
);
