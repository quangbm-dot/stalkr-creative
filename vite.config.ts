import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
  ],
  base: './', 
  build: {
    assetsInlineLimit: 100000000, 
    minify: true, 
    // Thêm đoạn này để tắt module preload polyfill
    modulePreload: {
      polyfill: false,
    },
    // Khuyên dùng: Đặt target thấp hơn một chút để đảm bảo tương thích
    target: 'es2015', 
  },
});