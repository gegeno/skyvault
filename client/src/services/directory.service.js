import apiClient from '@/lib/axios';

export const directoryService = {
  // Fetch directory contents (files and subfolders)
  getDirectory: async (id) => {
    const url = id ? `/directory/${id}` : '/directory';
    const { data } = await apiClient.get(url);
    return data;
  },

  // Create new folder
  createDirectory: async (name, parentId) => {
    const { data } = await apiClient.post('/directory', { name, parentId });
    return data;
  },

  // Soft delete (move to trash)
  deleteDirectory: async (id) => {
    const { data } = await apiClient.delete(`/directory/${id}`);
    return data;
  },

  // Move directory to new parent
  moveDirectory: async (id, newParentId) => {
    const { data } = await apiClient.patch(`/directory/${id}/move`, {
      newParentId,
    });
    return data;
  },

  // Rename Directory
  renameDirectory: async (id, name) => {
    const { data } = await apiClient.patch(`/directory/${id}`, { name });
    return data;
  },

  // Copy Directory
  copyDirectory: async (id, targetParentId) => {
    const { data } = await apiClient.patch(`/directory/${id}/copy`, {
      targetParentId,
    });
    return data;
  },
};
