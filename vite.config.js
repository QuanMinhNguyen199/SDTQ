import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  // Bản build dùng đường dẫn tương đối để chạy được ở GitHub Pages (/SDTQ/) lẫn khi mở từ thư mục bất kỳ.
  base: command === 'build' ? './' : '/',
  plugins: [tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: { output: { manualChunks: { three: ['three'], r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'] } } },
  },
}));
