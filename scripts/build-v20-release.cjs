/**
 * v20: build lại ĐÚNG bộ case/biến thể đã phát hành ở v19_release (xem
 * build-v19-release.cjs — CASES/rounds giữ nguyên y hệt), nhưng:
 *   - dùng code EvidenceChat mới (khung chat gõ dần, đáp án đề xuất, v.v.)
 *   - build cho TẤT CẢ mạng quảng cáo (không chỉ riêng AppLovin như trước)
 *
 *   node scripts/build-v20-release.cjs                       → build tất cả, mọi mạng
 *   node scripts/build-v20-release.cjs 15_reed                → chỉ case khớp 1 phần tên
 *   node scripts/build-v20-release.cjs all applovin,unity      → chỉ các mạng chỉ định
 *
 * STT đánh xuyên suốt theo thứ tự khai báo CASES bên dưới (giống hệt
 * v19_release) để file đặt tên nhất quán giữa 2 lần phát hành.
 *
 * Output: <repo chính>/build/v20_release/<mạng>/SMD_Playable_v20_<stt>_<n>quests_<tên> QuangBM_QuangBM.html
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NETWORKS = ["applovin", "unity", "ironsource", "google", "mindwork", "tiktok"];

const root = path.join(__dirname, "..");
const filter = process.argv[2] && process.argv[2] !== "all" ? process.argv[2].split(",") : null;
const nets = process.argv[3] ? process.argv[3].split(",") : NETWORKS;

// Y HỆT CASES trong build-v19-release.cjs — bộ case/rounds đã phát hành.
const CASES = [
  { caseId: "13_joss_calder_v19", name: "joss-calder", rounds: [3, 5, 7] },
  { caseId: "14_nora_ivo_v19", name: "nora-ivo", rounds: [3, 5, 7] },
  { caseId: "15_reed_sloane_v19", name: "reed-sloane", rounds: [3] },
  { caseId: "16_whitney_callie_v19", name: "whitney-callie", rounds: [3, 5, 7] },
  { caseId: "17_paige_grant_v19", name: "paige-grant", rounds: [3, 5, 7] },
  { caseId: "18_tessa_dylan_v19", name: "tessa-dylan", rounds: [5, 3] },
  { caseId: "19_harper_ellis_v19", name: "harper-ellis", rounds: [3, 5, 7] },
];
const ALL_JOBS = CASES.flatMap((c) => c.rounds.map((n) => ({ caseId: c.caseId, name: c.name, n }))).map(
  (j, i) => ({ ...j, seq: String(i + 1).padStart(2, "0") }),
);
const JOBS = ALL_JOBS.filter((j) => !filter || filter.some((f) => j.caseId.includes(f)));

const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outRoot = path.join(path.dirname(commonGit), "build", "v20_release");
fs.mkdirSync(outRoot, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");

const report = [];
let okCount = 0;
const totalRuns = JOBS.length * nets.length;
let done = 0;
for (const job of JOBS) {
  const label = `${job.caseId} (${job.n}q)`;
  console.log(`\n===== ${job.seq} ${label} — vite build (dùng chung cho mọi mạng)`);
  try {
    run("npx vite build", { V9_CASE: job.caseId, V9_EASY: "1", ROUNDS: String(job.n) });
  } catch (e) {
    report.push(`${label.padEnd(28)} VITE BUILD FAIL ${e.message.split("\n")[0]}`);
    done += nets.length;
    continue;
  }
  // "newchat" trong tên file để phân biệt rõ đây là bản V20 (khung chat
  // mới — gõ/trả lời lần lượt, không còn thẻ câu hỏi tĩnh như v19).
  const fname = `SMD_Playable_v20_${job.seq}_${job.n}quests_newchat_${job.name} QuangBM_QuangBM.html`;
  for (const net of nets) {
    done++;
    try {
      run(`node build-inline.cjs ${net}`);
      const dir = path.join(outRoot, net);
      fs.mkdirSync(dir, { recursive: true });
      const out = path.join(dir, fname);
      fs.copyFileSync(path.join(root, `build/index_${net}.html`), out);
      const mb = fs.statSync(out).size / 1024 / 1024;
      report.push(`[${done}/${totalRuns}] ${net.padEnd(10)} ${label.padEnd(28)} OK   ${mb.toFixed(2)} MB`);
      okCount++;
    } catch (e) {
      report.push(`[${done}/${totalRuns}] ${net.padEnd(10)} ${label.padEnd(28)} FAIL ${e.message.split("\n")[0]}`);
    }
  }
}
console.log("\n" + report.join("\n"));
console.log(`\n${okCount}/${totalRuns} build OK → ${outRoot}`);
