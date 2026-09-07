// Outpaint each KB's ORIGINAL reference couple photo (character-refs/{KB}/{KB}.jpg)
// vertically to a tall phone-wallpaper aspect ratio. Per instruction: do NOT
// regenerate/reinterpret the photo — keep the real photo's people/content
// exactly as-is, only extend the background above/below to fill the canvas.
import fs from "node:fs";
import path from "node:path";

const KEY_FILE = "gemini_api_key.txt";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
const OUT_DIR = "gemini-drafts";

function readApiKey() {
  const raw = fs.readFileSync(KEY_FILE, "utf8");
  const line = raw.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("#"));
  if (!line) throw new Error("No API key line found in " + KEY_FILE);
  return line;
}

async function callGemini(apiKey, promptText, images) {
  const parts = [{ text: promptText }];
  for (const img of images) parts.push({ inline_data: { mime_type: img.mime, data: img.data.toString("base64") } });
  const body = { contents: [{ parts }], generationConfig: { responseModalities: ["IMAGE"] } };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${text.slice(0, 500)}`);
  const json = JSON.parse(text);
  const cands = json.candidates?.[0]?.content?.parts ?? [];
  const imgPart = cands.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) throw new Error(`No image returned: ${JSON.stringify(json).slice(0, 500)}`);
  return Buffer.from((imgPart.inlineData || imgPart.inline_data).data, "base64");
}

const PROMPT = "Take this exact photo and outpaint (extend) it into a phone lock-screen wallpaper at 1080x2340 resolution (a tall 9:19.5 aspect ratio, much taller than the input). The input photo must appear unchanged, uncropped and unscaled in the middle of the new canvas — do not restyle, crop, or regenerate the people or existing content at all. Add a significant amount of new background content above AND below the original photo (roughly 30-40% extra height total) that naturally continues the same scene, lighting, and environment, so the final image is noticeably taller than the original. No text, no watermark, no added objects, no border or frame.";

const JOBS = [
  { out: "KB2_wallpaper_change.png", ref: "character-refs/KB2/KB2.jpg" },
  { out: "KB3_wallpaper_change.png", ref: "character-refs/KB3/KB3.jpg" },
  { out: "KB4_wallpaper_change.png", ref: "character-refs/KB4/KB4.jpg" },
];

async function main() {
  const apiKey = readApiKey();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const job of JOBS) {
    try {
      const refBytes = fs.readFileSync(job.ref);
      const buf = await callGemini(apiKey, PROMPT, [{ mime: "image/jpeg", data: refBytes }]);
      fs.writeFileSync(path.join(OUT_DIR, job.out), buf);
      console.log("wrote", job.out);
    } catch (e) {
      console.error("FAILED", job.out, "-", e.message);
    }
  }
}

main();
