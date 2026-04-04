import { authApi } from './authApi';

// Auth service replaced by backend JWT API
export const authService = {
  async register(email, password, userData) {
    const res = await authApi.register({ email, password, ...userData });
    return res;
  },

  async login(email, password) {
    const res = await authApi.login({ email, password });
    return res;
  },

  async logout() {
    await authApi.logout();
  },

  getCurrentUser() {
    // Frontend state should store user from JWT login flow
    return null;
  },

  onAuthStateChanged(/*callback*/) {
    // Not applicable for backend JWT flow; keep a no-op for now
    return () => {};
  }
};
