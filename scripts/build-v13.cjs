/**
 * v13: build playable "romance scam" (case 05_daniel_scam) cho từng mạng quảng cáo —
 * 2 bản độ dài: 3 hoặc 5 câu hỏi rồi vào endcard (xem __ROUNDS__ ở vite.config.ts).
 *   npm run build:v13                  → mọi mạng × 2 độ dài
 *   npm run build:v13 applovin,unity   → chỉ các mạng chỉ định
 * Output: <repo chính>/build/v13/<mạng>/SMD_Playable_v13_<01|02>_<N>quests_daniel_scam QuangBM_QuangBM.html
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NETWORKS = ["applovin", "unity", "ironsource", "google", "mindwork", "tiktok"];
const ROUNDS_VARIANTS = [3, 5];
const CASE_ID = "05_daniel_scam";

const root = path.join(__dirname, "..");
const nets = process.argv[2] ? process.argv[2].split(",") : NETWORKS;

const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outRoot = path.join(path.dirname(commonGit), "build", "v13");
fs.mkdirSync(outRoot, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
const report = [];
for (let vi = 0; vi < ROUNDS_VARIANTS.length; vi++) {
  const rounds = ROUNDS_VARIANTS[vi];
  const label = `${String(vi + 1).padStart(2, "0")}_${rounds}quests_daniel_scam`;
  console.log(`\n===== ${CASE_ID} (${rounds}q)`);
  run("npx vite build", { V9_CASE: CASE_ID, ROUNDS: String(rounds) });
  for (const net of nets) {
    run(`node build-inline.cjs ${net}`);
    const dir = path.join(outRoot, net);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, `SMD_Playable_v13_${label} QuangBM_QuangBM.html`);
    fs.copyFileSync(path.join(root, `build/index_${net}.html`), out);
    report.push(`${net.padEnd(10)} ${String(rounds).padEnd(2)}q ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
  }
}
console.log("\n" + report.join("\n"));
console.log(`\n→ ${outRoot}`);
