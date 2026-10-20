/**
 * v10: build từng case thành 1 file HTML độc lập cho từng mạng quảng cáo:
 *   npm run build:v10            → mọi case × mọi mạng
 *   npm run build:v10 casey      → chỉ case khớp tên
 *   npm run build:v10 casey applovin,unity   → chỉ các mạng chỉ định
 * Output: <repo chính>/build/v10/<mạng>/SMD_Playable_v10_<id> QuangBM_QuangBM.html
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NETWORKS = ["applovin", "unity", "ironsource", "google", "mindwork", "tiktok"];

const root = path.join(__dirname, "..");
const casesDir = path.join(root, "src/cases");
const filter = process.argv[2] && process.argv[2] !== "all" ? process.argv[2] : "";
const nets = process.argv[3] ? process.argv[3].split(",") : NETWORKS;
const ids = fs
  .readdirSync(casesDir)
  .filter((d) => fs.existsSync(path.join(casesDir, d, "index.ts")))
  .filter((d) => !filter || d.includes(filter))
  .sort();

// Worktree dùng chung thư mục build/ của repo chính (nơi để mọi bản SMD trước đó).
const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outRoot = path.join(path.dirname(commonGit), "build", "v10");
fs.mkdirSync(outRoot, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
const report = [];
for (const id of ids) {
  console.log(`\n===== ${id}`);
  run("npx vite build", { V9_CASE: id }); // 1 lần / case, dùng chung cho mọi mạng
  for (const net of nets) {
    run(`node build-inline.cjs ${net}`);
    const dir = path.join(outRoot, net);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, `SMD_Playable_v10_${id} QuangBM_QuangBM.html`);
    fs.copyFileSync(path.join(root, `build/index_${net}.html`), out);
    const mb = fs.statSync(out).size / 1024 / 1024;
    report.push(`${net.padEnd(10)} ${id.padEnd(18)} ${mb.toFixed(2)} MB`);
  }
}
console.log("\n" + report.join("\n"));
console.log(`\n→ ${outRoot}`);
