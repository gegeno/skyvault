import apiClient from '@/lib/axios';

export const vaultService = {
  // Setup secure vault with a PIN
  setup: async (pin) => {
    const { data } = await apiClient.post('/vault/setup', { pin });
    return data;
  },
  // Unlock the vault with the PIN
  unlock: async (pin) => {
    const { data } = await apiClient.post('/vault/unlock', { pin });
    return data;
  },
  //  Lock the vault
  lock: async () => {
    const { data } = await apiClient.post('/vault/lock');
    return data;
  },
};
