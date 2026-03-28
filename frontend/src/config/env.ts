const configuredApiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

const isLocalDevelopmentHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = isLocalDevelopmentHost
  ? configuredApiBaseUrl ?? 'http://localhost:3000/api'
  : configuredApiBaseUrl ?? '/api';

export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000);
