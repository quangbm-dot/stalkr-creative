/**
 * v11: build từng case thành 1 file HTML độc lập cho từng mạng quảng cáo —
 * mỗi case ra 3 bản độ dài khác nhau (3/5/8 câu hỏi rồi vào endcard, xem
 * __ROUNDS__ ở vite.config.ts + buildStoryCase.ts). Y hệt build-v10.cjs
 * nhưng output riêng thư mục/tên "v11" (cinematic intro), để không đè lên
 * bản build "v10" (intro cũ) ở branch v10/smd-playables.
 *   npm run build:v11            → mọi case × mọi mạng × 3 độ dài
 *   npm run build:v11 casey      → chỉ case khớp tên
 *   npm run build:v11 casey applovin,unity   → chỉ các mạng chỉ định
 * Output: <repo chính>/build/v11/<mạng>/SMD_Playable_v11_<stt>_<N>quests_<tên case> QuangBM_QuangBM.html
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NETWORKS = ["applovin", "unity", "ironsource", "google", "mindwork", "tiktok"];
const ROUNDS_VARIANTS = [3, 5, 8];

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
const outRoot = path.join(path.dirname(commonGit), "build", "v11");
fs.mkdirSync(outRoot, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
const report = [];
for (const id of ids) {
  for (const rounds of ROUNDS_VARIANTS) {
    console.log(`\n===== ${id} (${rounds}q)`);
    run("npx vite build", { V9_CASE: id, ROUNDS: String(rounds) }); // 1 lần / case / độ dài, dùng chung cho mọi mạng
    // id dạng "01_casey_miles" — chèn "<N>quests_" ngay giữa số thứ tự case
    // và tên case: "01_3quests_casey_miles" (giữ nguyên số thứ tự thật của
    // case, không phải số đếm biến thể).
    const [, stt, caseName] = id.match(/^(\d+)_(.+)$/) ?? [, id, ""];
    const fileLabel = caseName ? `${stt}_${rounds}quests_${caseName}` : `${id}_${rounds}quests`;
    for (const net of nets) {
      run(`node build-inline.cjs ${net}`);
      const dir = path.join(outRoot, net);
      fs.mkdirSync(dir, { recursive: true });
      const out = path.join(dir, `SMD_Playable_v11_${fileLabel} QuangBM_QuangBM.html`);
      fs.copyFileSync(path.join(root, `build/index_${net}.html`), out);
      const mb = fs.statSync(out).size / 1024 / 1024;
      report.push(`${net.padEnd(10)} ${id.padEnd(18)} ${String(rounds).padEnd(2)}q ${mb.toFixed(2)} MB`);
    }
  }
}
console.log("\n" + report.join("\n"));
console.log(`\n→ ${outRoot}`);
