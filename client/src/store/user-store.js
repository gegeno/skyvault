import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),

  incrementStorage: (bytes) =>
    set((state) => ({
      user: state.user ? { ...state.user, storageUsed: state.user.storageUsed + bytes } : null,
    })),
}));
