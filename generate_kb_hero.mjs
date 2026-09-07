// Generate a "hero" photo (client+owner together, happy) per KB, composited
// from their two already-approved solo avatars. Analogue of KB1's coupleHero.
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

const JOBS = [
  {
    out: "KB2_hero_change.png",
    imgs: ["gemini-drafts/KB2_client_Kevin_change.png", "gemini-drafts/KB2_owner_Mia_change.png"],
    prompt: "Using the two people in these reference images (keep both faces/likeness consistent), create ONE new warm, happy couple photo of them together, close and affectionate, outdoors in golden-hour light, natural phone-camera style. Portrait orientation (tall, roughly 3:4). No text or watermark.",
  },
  {
    out: "KB3_hero_change.png",
    imgs: ["gemini-drafts/KB3_owner_Alex_change.png", "gemini-drafts/KB3_client_Sophia_change.png"],
    prompt: "Using the two people in these reference images (keep both faces/likeness consistent), create ONE new warm, happy couple photo of them together, close and affectionate, at an upscale outdoor restaurant setting, natural phone-camera style. Portrait orientation (tall, roughly 3:4). No text or watermark.",
  },
  {
    out: "KB4_hero_change.png",
    imgs: ["gemini-drafts/KB4_owner_Daniel_change.png", "gemini-drafts/KB4_client_Sarah_change.png"],
    prompt: "Using the two people in these reference images (keep both faces/likeness consistent), create ONE new warm, happy couple photo of them together, close and affectionate, outdoors with tropical greenery in the background, natural phone-camera style. Portrait orientation (tall, roughly 3:4). No text or watermark.",
  },
];

async function main() {
  const apiKey = readApiKey();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const job of JOBS) {
    try {
      const images = job.imgs.map((p) => ({ mime: "image/png", data: fs.readFileSync(p) }));
      const buf = await callGemini(apiKey, job.prompt, images);
      fs.writeFileSync(path.join(OUT_DIR, job.out), buf);
      console.log("wrote", job.out);
    } catch (e) {
      console.error("FAILED", job.out, "-", e.message);
    }
  }
}

main();
