import httpClient from './httpClient';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions?: string[];
    emailVerified?: boolean;
    phone?: string;
    department?: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  firstName: string;
  lastName: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await httpClient.post<AuthResponse>('/auth/login', payload);
      return data;
    } catch (error: any) {
      console.error('Login API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please check your internet connection');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your connection');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await httpClient.post<AuthResponse>('/auth/register', payload);
      return data;
    } catch (error: any) {
      console.error('Registration API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        throw new Error('Email already registered');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid registration data');
      } else if (error.response?.status === 429) {
        throw new Error('Too many registration attempts. Please try again later');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please check your internet connection');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your connection');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } catch (error: any) {
      console.error('Logout API error:', error);
      // Don't throw error for logout - always succeed locally
    }
  },

  async getProfile(): Promise<AuthResponse['user']> {
    try {
      const { data } = await httpClient.get<AuthResponse['user']>('/auth/me');
      return data;
    } catch (error: any) {
      console.error('Get profile API error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please check your internet connection');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your connection');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to get profile');
    }
  },
};
