import { create } from 'zustand'

/**
 * Experiment store — caches the active experiment and its sub-resources
 * so sibling components (tabs, wizard summary panel) share live data
 * without redundant API calls.
 */
export const useExperimentStore = create((set) => ({
  // Active experiment (full detail object)
  experiment: null,
  phases: [],
  groups: [],

  setExperiment: (experiment) => set({ experiment }),
  setPhases:     (phases)     => set({ phases }),
  setGroups:     (groups)     => set({ groups }),

  // Optimistic status update (local only; caller must sync with API)
  updateStatus: (status) =>
    set((state) => ({
      experiment: state.experiment ? { ...state.experiment, status } : null,
    })),

  // Reset when leaving experiment detail
  clear: () => set({ experiment: null, phases: [], groups: [] }),
}))
