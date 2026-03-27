import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-well-completion': resolve(__dirname, '../react-well-completion/src/index.ts'),
    },
  },
})
