/**
 * v15: build các case (dựng trên nền v10 — Intro.tsx đoạn chat tự chạy)
 * cho từng mạng quảng cáo — mỗi case ra 2 bản độ dài 5/7 câu (xem
 * __ROUNDS__ ở vite.config.ts).
 *   npm run build:v15                  → mọi mạng
 *   npm run build:v15 applovin,unity   → chỉ các mạng chỉ định
 * Output: <repo chính>/build/v15/<mạng>/SMD_Playable_v15_<01|02|03|04>_<N>quests_<case> QuangBM_QuangBM.html
 *   (01=5q abby_ryan_full, 02=7q abby_ryan_full, 03=5q sophie_mark, 04=7q sophie_mark)
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NETWORKS = ["applovin", "unity", "ironsource", "google", "mindwork", "tiktok"];
const ROUNDS_VARIANTS = [5, 7];
const CASES = [
  { id: "07_abby_ryan_full", label: "abby_ryan_full" },
  { id: "08_sophie_mark", label: "sophie_mark" },
];

const root = path.join(__dirname, "..");
const nets = process.argv[2] ? process.argv[2].split(",") : NETWORKS;

const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outRoot = path.join(path.dirname(commonGit), "build", "v15");
fs.mkdirSync(outRoot, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
const report = [];
let variantNum = 0;
for (const { id: CASE_ID, label: caseLabel } of CASES) {
  for (const rounds of ROUNDS_VARIANTS) {
    variantNum++;
    const variantIdx = String(variantNum).padStart(2, "0");
    const label = `${variantIdx}_${rounds}quests_${caseLabel}`;
    console.log(`\n===== ${CASE_ID} (${rounds}q)`);
    run("npx vite build", { V9_CASE: CASE_ID, ROUNDS: String(rounds) });
    for (const net of nets) {
      run(`node build-inline.cjs ${net}`);
      const dir = path.join(outRoot, net);
      fs.mkdirSync(dir, { recursive: true });
      const out = path.join(dir, `SMD_Playable_v15_${label} QuangBM_QuangBM.html`);
      fs.copyFileSync(path.join(root, `build/index_${net}.html`), out);
      report.push(`${net.padEnd(10)} ${caseLabel.padEnd(16)} ${String(rounds).padEnd(2)}q ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
    }
  }
}
console.log("\n" + report.join("\n"));
console.log(`\n→ ${outRoot}`);
