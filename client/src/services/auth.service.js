import apiClient from '@/lib/axios';

export const authService = {
  // Login
  login: async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  // Google Login
  googleLogin: async (idToken) => {
    const { data } = await apiClient.post('/auth/google-login', { idToken });
    return data;
  },

  // Send OTP
  sendOtp: async (email) => {
    const { data } = await apiClient.post('/auth/send-otp', { email });
    return data;
  },

  // Register
  register: async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  // Get Current User (Session)
  getCurrentUser: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  // Logout
  logout: async () => {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const { data } = await apiClient.post('/auth/reset-password', {
      token,
      password,
    });
    return data;
  },
};
