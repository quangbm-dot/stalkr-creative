/**
 * Bản "dễ" của build-v9.cjs — build:v9 build thế nào thì cái này y hệt,
 * chỉ thêm V9_EASY=1 (xem vite.config.ts + src/cases/buildCase.ts: ít lựa
 * chọn sai hơn, hint hiện sẵn luôn) và đặt tên file có hậu tố " easy":
 *   npm run build:v9:easy            → cả 4 case
 *   npm run build:v9:easy gus        → chỉ case khớp tên
 * Output: <repo chính>/build/SMD_Playable_v9_<id>_easy QuangBM_QuangBM.html
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const casesDir = path.join(root, "src/cases");
const filter = process.argv[2];
const ids = fs
  .readdirSync(casesDir)
  .filter((d) => fs.existsSync(path.join(casesDir, d, "index.ts")))
  .filter((d) => !filter || d.includes(filter))
  .sort();

const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outDir = path.join(path.dirname(commonGit), "build");
fs.mkdirSync(outDir, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
for (const id of ids) {
  console.log(`\n===== ${id} (easy)`);
  run("npx vite build", { V9_CASE: id, V9_EASY: "1" });
  run("node build-inline.cjs applovin");
  const out = path.join(outDir, `SMD_Playable_v9_${id}_easy QuangBM_QuangBM.html`);
  fs.copyFileSync(path.join(root, "build/index_applovin.html"), out);
  console.log(`→ ${out} (${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
}
