import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      // Force esbuild to use the specific version
      // that is compatible with your system
      // This should bypass the version check
      define: {
        'process.env.npm_package_version': '"0.25.1"'
      }
    }
  }
})
