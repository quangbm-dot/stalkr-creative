/**
 * npm run dev            → tất cả case (trang Gallery), giống `npm run dev all`
 * npm run dev all        → tất cả case, xem song song trên 1 trang
 * npm run dev gus        → chỉ 1 case (khớp 1 phần tên thư mục trong src/cases)
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const arg = process.argv[2];
const env = { ...process.env };
if (arg && arg !== "all") {
  const ids = fs.readdirSync(path.join(__dirname, "../src/cases")).filter((d) => fs.existsSync(path.join(__dirname, "../src/cases", d, "index.ts")));
  const match = ids.find((d) => d === arg) ?? ids.find((d) => d.includes(arg));
  if (!match) {
    console.error(`Không tìm thấy case "${arg}". Có: ${ids.join(", ")}`);
    process.exit(1);
  }
  env.V9_CASE = match;
  console.log(`Dev case: ${match}`);
} else {
  console.log("Dev ALL cases — mở URL bên dưới để xem Gallery");
}

const child = spawn("npx", ["vite", "--host", ...process.argv.slice(3)], { stdio: "inherit", env, shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
