import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LabelCategory } from 'react-well-completion';
import { LABEL_CATEGORIES } from 'react-well-completion';

export type { LabelCategory };
export { LABEL_CATEGORIES };

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
