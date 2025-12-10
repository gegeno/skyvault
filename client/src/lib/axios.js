import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Sends cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global Error Handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized.');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
