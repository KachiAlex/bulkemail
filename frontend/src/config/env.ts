const configuredApiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

const isLocalDevelopmentHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = isLocalDevelopmentHost
  ? configuredApiBaseUrl ?? 'http://localhost:3000/api'
  : configuredApiBaseUrl ?? '/api';

export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000);

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration Debug:');
  console.log('- VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('- configuredApiBaseUrl:', configuredApiBaseUrl);
  console.log('- isLocalDevelopmentHost:', isLocalDevelopmentHost);
  console.log('- Final API_BASE_URL:', API_BASE_URL);
  console.log('- API_TIMEOUT_MS:', API_TIMEOUT_MS);
}
