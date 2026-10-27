/**
 * v14: build playable "Abby & Ryan / Lauren Reyes" (case 06_abby_ryan) cho từng mạng quảng cáo —
 * bản 7 câu hỏi rồi vào ledger/endcard (xem __ROUNDS__ ở vite.config.ts).
 *   npm run build:v14                  → mọi mạng
 *   npm run build:v14 applovin,unity   → chỉ các mạng chỉ định
 * Output: <repo chính>/build/v14/<mạng>/SMD_Playable_v14_01_7quests_abby_ryan QuangBM_QuangBM.html
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NETWORKS = ["applovin", "unity", "ironsource", "google", "mindwork", "tiktok"];
const ROUNDS_VARIANTS = [7];
const CASE_ID = "06_abby_ryan";

const root = path.join(__dirname, "..");
const nets = process.argv[2] ? process.argv[2].split(",") : NETWORKS;

const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outRoot = path.join(path.dirname(commonGit), "build", "v14");
fs.mkdirSync(outRoot, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
const report = [];
for (let vi = 0; vi < ROUNDS_VARIANTS.length; vi++) {
  const rounds = ROUNDS_VARIANTS[vi];
  const label = `${String(vi + 1).padStart(2, "0")}_${rounds}quests_abby_ryan`;
  console.log(`\n===== ${CASE_ID} (${rounds}q)`);
  run("npx vite build", { V9_CASE: CASE_ID, ROUNDS: String(rounds) });
  for (const net of nets) {
    run(`node build-inline.cjs ${net}`);
    const dir = path.join(outRoot, net);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, `SMD_Playable_v14_${label} QuangBM_QuangBM.html`);
    fs.copyFileSync(path.join(root, `build/index_${net}.html`), out);
    report.push(`${net.padEnd(10)} ${String(rounds).padEnd(2)}q ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
  }
}
console.log("\n" + report.join("\n"));
console.log(`\n→ ${outRoot}`);
