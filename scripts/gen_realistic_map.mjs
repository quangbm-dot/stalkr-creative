// One-off: generate a believable "Google-Maps-style" city map corner for the
// v12 "map tracking" intro — các bản trước (minh hoạ cách điệu phẳng, rồi
// bản render 3D) đều bị chê trông giả. Lần này mô phỏng đúng phong cách màu
// sắc quen mắt của Google Maps (nền be nhạt, đường trắng viền xám, 1-2 đường
// chính màu vàng/cam, công viên xanh lục nhạt, sông xanh nhạt) — không chữ,
// không logo (tránh dính thương hiệu thật), chỉ 1 góc khu phố, nhìn thẳng từ
// trên xuống (không phải render 3D nghiêng).
import fs from "node:fs";

const KEY_FILE = "../../gemini_api_key.txt";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
const OUT_DIR = "src/Components/IntroMapTracking/img";

function readApiKey() {
  const raw = fs.readFileSync(KEY_FILE, "utf8");
  const line = raw
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#"));
  if (!line) throw new Error("No API key line found in " + KEY_FILE);
  return line;
}

async function gen(apiKey, prompt, outFile) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${text.slice(0, 500)}`);
  const json = JSON.parse(text);
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) throw new Error(`No image returned for ${outFile}. Response: ${JSON.stringify(json).slice(0, 800)}`);
  const data = (imgPart.inlineData || imgPart.inline_data).data;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(`${OUT_DIR}/${outFile}`, Buffer.from(data, "base64"));
  console.log("wrote", `${OUT_DIR}/${outFile}`);
}

async function main() {
  const apiKey = readApiKey();
  await gen(
    apiKey,
    "A flat, top-down 2D digital map screenshot in the exact visual style of a mainstream phone navigation app (like Google Maps default light theme): pale cream/beige land background, white street roads with thin light-gray outlines, one or two slightly wider arterial roads tinted pale yellow/orange, a muted light-green park polygon with a subtle darker-green dot texture, a soft pale-blue river or water shape, small light-gray rectangular building block footprints scattered along the streets, flat vector cartography style (NOT 3D, NOT isometric, NOT a photo, no shadows, no perspective), viewed straight from directly above, zoomed into just one city block / neighborhood corner (not a whole city radiating outward), absolutely no text, no street names, no labels, no icons, no pins, no logos, no watermark, no UI chrome, portrait orientation.",
    "realisticMap.jpg",
  );
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
