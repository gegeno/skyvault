import apiClient from '@/lib/axios';

export const searchService = {
  search: async (query) => {
    const { data } = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};
