import { create } from 'zustand';

export const useFileStore = create((set) => ({
  viewMode: 'grid',
  history: [{ id: null, name: 'My Drive' }],

  toggleViewMode: () => set((state) => ({ viewMode: state.viewMode === 'grid' ? 'list' : 'grid' })),

  pushFolder: (id, name) =>
    set((state) => {
      if (state.history.some((h) => h.id === id)) return state;
      return { history: [...state.history, { id, name }] };
    }),

  navigateTo: (index) => set((state) => ({ history: state.history.slice(0, index + 1) })),

  resetHistory: () => set({ history: [{ id: null, name: 'My Drive' }] }),
}));
