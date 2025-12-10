import apiClient from '@/lib/axios';

export const shareService = {
  // Create Link to Share a file or directory
  createShareLink: async (itemId, type) => {
    const endpoint = type === 'file' ? `/share/file/${itemId}` : `/share/directory/${itemId}`;
    const { data } = await apiClient.post(endpoint);
    return data;
  },

  // Revoke Link
  deleteShareLink: async (itemId, type) => {
    const endpoint = type === 'file' ? `/share/file/${itemId}` : `/share/directory/${itemId}`;
    const { data } = await apiClient.delete(endpoint);
    return data;
  },

  // Get detailes of a publically shareed item
  getPublicShareDetails: async (shareId) => {
    const { data } = await apiClient.get(`/public/share/${shareId}`);
    return data;
  },

  // Get Public Download URL for a shared file
  getPublicDownloadUrl: (shareId) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/public/download/${shareId}`;
  },

  // Get Shared Items
  getSharedByMe: async () => {
    const { data } = await apiClient.get('/share/me');
    return data;
  },
};
