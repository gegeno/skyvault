import apiClient from '@/lib/axios';
import axios from 'axios';

export const fileService = {
  // Get Pre-signed URL
  initiateUpload: async (file, parentId) => {
    const { data } = await apiClient.post('/file/upload/initiate', {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      parentId: parentId || undefined, // Backend expects null/undefined for root
    });
    return data.data; // Returns { uploadUrl, fileId }
  },

  // Upload Binary to S3 (Directly)
  uploadToS3: async (uploadUrl, file, onProgress, signal) => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      },
      signal: signal, // Pass the AbortSignal to axios
    });
  },

  // Confirm Upload
  completeUpload: async (fileId) => {
    const { data } = await apiClient.post('/file/upload/complete', { fileId });
    return data.data;
  },

  // Soft Delete (Move to Trash)
  deleteFile: async (id) => {
    const { data } = await apiClient.delete(`/file/${id}`);
    return data;
  },

  // Move File (Used for Restore too)
  moveFile: async (id, newParentId) => {
    const { data } = await apiClient.patch(`/file/${id}/move`, { newParentId });
    return data;
  },

  // Rename File
  renameFile: async (id, name) => {
    const { data } = await apiClient.patch(`/file/${id}`, { name });
    return data;
  },

  // Copy File
  copyFile: async (id, targetParentId) => {
    const { data } = await apiClient.patch(`/file/${id}/copy`, {
      targetParentId,
    });
    return data;
  },
};
