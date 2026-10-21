import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

declare const process: { env: Record<string, string | undefined> };

/**
 * v9: `virtual:v9-cases` = danh sách case được bundle. Có V9_CASE (build từng
 * playable / `npm run dev gus`) thì chỉ import đúng 1 case — file HTML chỉ
 * chứa ảnh của case đó. Không có thì import tất cả (`npm run dev all`).
 */
function v9Cases(): Plugin {
  const VIRTUAL = 'virtual:v9-cases';
  const RESOLVED = '\0' + VIRTUAL;
  return {
    name: 'v9-cases',
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      const only = process.env.V9_CASE;
      if (only) return `import c from "/src/cases/${only}/index.ts";\nexport default [c];`;
      return [
        'const m = import.meta.glob("/src/cases/*/index.ts", { eager: true, import: "default" });',
        'export default Object.keys(m).sort().map((k) => m[k]);',
      ].join('\n');
    },
  };
}

export default defineConfig({
  plugins: [
    v9Cases(),
    react(),
    viteSingleFile(),
  ],
  // v9: bản "dễ" (V9_EASY=1 khi build) — ít lựa chọn sai hơn + hint tự hiện
  // sẵn luôn, không cần bấm 💡. Xem src/cases/buildCase.ts.
  // v10: số câu hỏi chơi trước khi vào endcard (ROUNDS=3/5/8 khi build) — xem
  // src/cases/buildStoryCase.ts. Mặc định 8 khi không set.
  define: {
    __V9_EASY__: JSON.stringify(process.env.V9_EASY === '1'),
    __ROUNDS__: JSON.stringify(Number(process.env.ROUNDS) || 8),
  },
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
