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
  // Danh sách ID NHẸ (không load data case nào cả) — dùng cho nút chuyển
  // case trong DevBar, tách riêng khỏi virtual:v9-cases (giờ chỉ trả đúng 1
  // case/lần, không còn chỗ lấy danh sách đầy đủ để hiện nút next/back).
  // Build thật (V9_CASE set) thì chỉ 1 phần tử — không glob gì thêm, khỏi
  // lo phình file build.
  const IDS_VIRTUAL = 'virtual:v9-case-ids';
  const IDS_RESOLVED = '\0' + IDS_VIRTUAL;
  // Dev-only (apply:'serve', không đụng build thật): `npm run dev` không set
  // V9_CASE thì mặc định Gallery (load TẤT CẢ case — nặng, chỉ 1 lần duyệt
  // nhanh). Nhưng mở trực tiếp 1 URL có ?case=<id> (vd bấm nút chuyển case
  // trong DevBar, mỗi lần là 1 navigation thật) thì chỉ cần load ĐÚNG 1 case
  // đó — đỡ lag hẳn, không phải kéo ảnh/data của 12 case khác mỗi lần chuyển.
  let devCase: string | undefined;
  return {
    name: 'v9-cases',
    configureServer(server) {
      server.middlewares.use((req: { url?: string }, _res, next) => {
        // Tự tách query string thay vì dùng URL/node:url — tránh phụ thuộc
        // @types/node (không có trong devDependencies của repo này).
        const qIdx = (req.url || '').indexOf('?');
        if (qIdx !== -1) {
          const m = req.url!.slice(qIdx + 1).match(/(?:^|&)case=([^&]+)/);
          const next_ = m ? decodeURIComponent(m[1]) : undefined;
          if (next_ && next_ !== devCase) {
            devCase = next_;
            // Vite cache transform của module theo ID, không tự biết nội
            // dung virtual:v9-cases phụ thuộc devCase — phải tự invalidate
            // thì request tiếp theo mới chạy lại load() thay vì trả bản cũ
            // (đây chính là lý do bấm chuyển case không ăn: case mới vào
            // middleware đúng nhưng module vẫn trả về case cache từ trước).
            const mod = server.moduleGraph.getModuleById(RESOLVED);
            if (mod) server.moduleGraph.invalidateModule(mod);
          }
        }
        next();
      });
    },
    resolveId: (id) => (id === VIRTUAL || id === IDS_VIRTUAL ? '\0' + id : null),
    load(id) {
      if (id === IDS_RESOLVED) {
        // Build thật luôn set V9_CASE -> đúng 1 id, không glob gì cả.
        if (process.env.V9_CASE) return `export default ${JSON.stringify([process.env.V9_CASE])};`;
        // Nút chuyển case trong DevBar chỉ để review lô case MỚI (hậu tố
        // "_v19" — data vừa fill 7 câu, chưa build ra HTML chính thức nào),
        // không trộn lẫn các case cũ (01-12) đã có creative/build riêng rồi.
        return [
          'const m = import.meta.glob("/src/cases/*/index.ts");',
          'export default Object.keys(m).sort().map((k) => k.split("/")[3]).filter((id) => id.endsWith("_v19"));',
        ].join('\n');
      }
      if (id !== RESOLVED) return null;
      const only = process.env.V9_CASE || devCase;
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
