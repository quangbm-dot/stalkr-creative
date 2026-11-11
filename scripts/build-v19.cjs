/**
 * v19: build 1 bản HTML (easy, mạng applovin) cho MỖI case có hậu tố
 * "_v19" trong src/cases — tức toàn bộ lô case vừa fill data 7 câu để
 * review (xem scripts/v19_batch_convert.py), không đụng tới các case cũ
 * (01-12) đã build riêng từ trước.
 *
 *   npm run build:v19                  → build hết mọi case "_v19"
 *   npm run build:v19 nora,sutton      → chỉ case khớp 1 phần tên
 *
 * Output: <repo chính>/build/v19/<id>.html (vd 14_nora_ivo_v19.html)
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const casesDir = path.join(root, "src/cases");
const filter = process.argv[2] ? process.argv[2].split(",") : null;

const ids = fs
  .readdirSync(casesDir)
  .filter((d) => d.endsWith("_v19") && fs.existsSync(path.join(casesDir, d, "index.ts")))
  .filter((d) => !filter || filter.some((f) => d.includes(f)))
  .sort();

if (!ids.length) {
  console.error("Không tìm thấy case nào có hậu tố _v19 khớp filter.");
  process.exit(1);
}

const commonGit = execSync("git rev-parse --path-format=absolute --git-common-dir", { cwd: root }).toString().trim();
const outDir = path.join(path.dirname(commonGit), "build", "v19");
fs.mkdirSync(outDir, { recursive: true });

const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

run("npx tsc -b");
const report = [];
let okCount = 0;
for (const id of ids) {
  console.log(`\n===== ${id} (easy)`);
  try {
    run("npx vite build", { V9_CASE: id, V9_EASY: "1" });
    run("node build-inline.cjs applovin");
    const out = path.join(outDir, `${id}.html`);
    fs.copyFileSync(path.join(root, "build/index_applovin.html"), out);
    report.push(`${id.padEnd(28)} OK   ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
    okCount++;
  } catch (e) {
    report.push(`${id.padEnd(28)} FAIL ${e.message.split("\n")[0]}`);
  }
}
console.log("\n" + report.join("\n"));
console.log(`\n${okCount}/${ids.length} case build OK → ${outDir}`);
