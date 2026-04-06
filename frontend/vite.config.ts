import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env variables, regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Force environment variables for production
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    define: {
      // Force the API base URL in production
      __API_BASE_URL__: JSON.stringify(
        isProduction ? '/api' : (env.VITE_API_BASE_URL || 'http://localhost:3000/api')
      ),
      __API_TIMEOUT_MS__: JSON.stringify(
        isProduction ? '30000' : (env.VITE_API_TIMEOUT_MS || '30000')
      ),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    resolve: {
      alias: {
        '@': '/src',
        'date-fns/format': fileURLToPath(new URL('./node_modules/date-fns/format.js', import.meta.url))
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000/api',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-v5.js`,
          chunkFileNames: `assets/[name]-[hash]-v5.js`,
          assetFileNames: `assets/[name]-[hash]-v5.[ext]`
        }
      },
      target: 'esnext',
      minify: 'esbuild'
    },
    esbuild: {
      target: 'es2020'
    }
  };
});

