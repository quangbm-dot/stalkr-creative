/**
 * Build từng case v9 thành 1 file HTML độc lập (AppLovin/MRAID):
 *   npm run build:v9            → cả 4 case
 *   npm run build:v9 gus        → chỉ case khớp tên
 * Output: <repo chính>/build/SMD_Playable_v9_<id> QuangBM_QuangBM.html
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

// Worktree dùng chung thư mục build/ của repo chính (nơi để mọi bản SMD trước đó).
const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outDir = path.join(path.dirname(commonGit), "build");
fs.mkdirSync(outDir, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
for (const id of ids) {
  console.log(`\n===== ${id}`);
  run("npx vite build", { V9_CASE: id });
  run("node build-inline.cjs applovin");
  const out = path.join(outDir, `SMD_Playable_v9_${id} QuangBM_QuangBM.html`);
  fs.copyFileSync(path.join(root, "build/index_applovin.html"), out);
  console.log(`→ ${out} (${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
}
