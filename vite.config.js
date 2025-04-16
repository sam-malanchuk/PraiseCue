import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: true,          // Allow all IPs to access (0.0.0.0)
    port: 80,            // Run server on port 80
    strictPort: true     // Exit if port 80 is unavailable
  }
  
})

