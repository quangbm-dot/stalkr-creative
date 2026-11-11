/**
 * Build bản phát hành cho các case đã duyệt, đặt tên theo đúng format cũ
 * (SMD_Playable_v19_<stt>_<n>quests_<name> QuangBM_QuangBM.html). Mỗi case
 * tự khai số câu cần build (case đủ data thì 3/5/7, case ít câu hơn — xem
 * CaseOverrides.questions.length — chỉ build đúng số đang có, build thêm
 * bản 5/7 với case chỉ 3-4 câu sẽ ra file TRÙNG hệt bản 3 câu, vô nghĩa).
 *
 *   node scripts/build-v19-release.cjs            → build tất cả
 *   node scripts/build-v19-release.cjs 15_reed    → chỉ case khớp 1 phần tên
 *
 * STT đánh xuyên suốt theo thứ tự khai báo CASES bên dưới, luôn ổn định dù
 * chỉ build 1 phần (lọc KHÔNG đổi số thứ tự của các job khác).
 *
 * Output: <repo chính>/build/v19_release/*.html
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const filter = process.argv[2] ? process.argv[2].split(",") : null;

const CASES = [
  { caseId: "13_joss_calder_v19", name: "joss-calder", rounds: [3, 5, 7] },
  { caseId: "14_nora_ivo_v19", name: "nora-ivo", rounds: [3, 5, 7] },
  // Story gốc chỉ còn đủ data sạch cho 3 câu (xem src/cases/15_reed_sloane_v19/index.ts) —
  // không build 5/7 vì sẽ ra file giống hệt bản 3 câu.
  { caseId: "15_reed_sloane_v19", name: "reed-sloane", rounds: [3] },
  { caseId: "16_whitney_callie_v19", name: "whitney-callie", rounds: [3, 5, 7] },
  { caseId: "17_paige_grant_v19", name: "paige-grant", rounds: [3, 5, 7] },
  // Story gốc chỉ còn đủ data sạch cho 5 câu — không build 7 (sẽ giống hệt
  // bản 5 câu). 5 liệt kê TRƯỚC 3 để giữ nguyên STT 14 đã phát hành.
  { caseId: "18_tessa_dylan_v19", name: "tessa-dylan", rounds: [5, 3] },
  { caseId: "19_harper_ellis_v19", name: "harper-ellis", rounds: [3, 5, 7] },
];
// Mỗi bản (case x số câu) là 1 file riêng — đánh số tuần tự 01..n xuyên suốt
// toàn bộ danh sách (gán TRƯỚC khi lọc, nên lọc build 1 phần không làm xê
// dịch STT của các file khác đã phát hành).
const ALL_JOBS = CASES.flatMap((c) => c.rounds.map((n) => ({ caseId: c.caseId, name: c.name, n }))).map(
  (j, i) => ({ ...j, seq: String(i + 1).padStart(2, "0") }),
);
const JOBS = ALL_JOBS.filter((j) => !filter || filter.some((f) => j.caseId.includes(f)));

const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outDir = path.join(path.dirname(commonGit), "build", "v19_release");
fs.mkdirSync(outDir, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");

const report = [];
let okCount = 0;
JOBS.forEach((job) => {
  const seq = job.seq;
  const label = `${job.caseId} (${job.n}q)`;
  console.log(`\n===== ${seq} ${label}`);
  try {
    run("npx vite build", { V9_CASE: job.caseId, V9_EASY: "1", ROUNDS: String(job.n) });
    run("node build-inline.cjs applovin");
    const fname = `SMD_Playable_v19_${seq}_${job.n}quests_${job.name} QuangBM_QuangBM.html`;
    const out = path.join(outDir, fname);
    fs.copyFileSync(path.join(root, "build/index_applovin.html"), out);
    report.push(`${label.padEnd(28)} OK   ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB  ${fname}`);
    okCount++;
  } catch (e) {
    report.push(`${label.padEnd(28)} FAIL ${e.message.split("\n")[0]}`);
  }
});
console.log("\n" + report.join("\n"));
console.log(`\n${okCount}/${JOBS.length} build OK → ${outDir}`);
