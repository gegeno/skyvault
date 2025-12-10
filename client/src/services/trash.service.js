import apiClient from '@/lib/axios';

export const trashService = {
  // Empty the trash bin
  emptyTrash: async () => {
    const { data } = await apiClient.delete('/trash/empty');
    return data;
  },
  // Permanently delete a file from trash
  permanentDeleteFile: async (id) => {
    const { data } = await apiClient.delete(`/trash/permanent/file/${id}`);
    return data;
  },
  // Permanently delete a directory from trash
  permanentDeleteDirectory: async (id) => {
    const { data } = await apiClient.delete(`/trash/permanent/directory/${id}`);
    return data;
  },
};
