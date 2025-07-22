import api from './api';

// Auth Services
export const authAPI = {
  // Register user

    // Check username availability
  checkUsername: async (username) => {
    try {
      const response = await api.post('/auth/check-username', { username });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Username check failed',
      };
    }
  },

  // Check email availability
  checkEmail: async (email) => {
    try {
      const response = await api.post('/auth/check-email', { email });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Email check failed',
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      localStorage.removeItem('token');
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Logout failed',
      };
    }
  },
};

// User Services
export const userAPI = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch users',
      };
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put('/users', { id: userId, role });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user role',
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch profile',
      };
    }
  },
};



// Generic API helper
export const apiHelper = {
  // Handle API response
  handleResponse: (response) => {
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // Show error message
  showError: (error) => {
    console.error('API Error:', error);
    // You can integrate with toast/notification library here
    alert(error.message || 'An error occurred');
  },

  // Show success message
  showSuccess: (message) => {
    console.log('API Success:', message);
    // You can integrate with toast/notification library here
    alert(message);
  },
};
