import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: { output: { manualChunks: { three: ['three'], r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'] } } },
  },
});
