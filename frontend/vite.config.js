import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure server for SPA routing
    host: true,
    port: 5173,
    strictPort: true,
    historyApiFallback: true,
    // Handle client-side routing by returning index.html for all routes
    // this will ensure we don't get 404s when refreshing on client-side routes
    proxy: {},
  },
  preview: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      // Force esbuild to use the specific version
      // that is compatible with your system
      // This should bypass the version check
      define: {
        'process.env.npm_package_version': '"0.25.1"'
      }
    },
    include: [
      'react-monaco-editor',
      'monaco-editor/esm/vs/editor/editor.api'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    // Help with react-monaco-editor compatibility
    alias: {
      'react-dom': 'react-dom'
    }
  }
})
