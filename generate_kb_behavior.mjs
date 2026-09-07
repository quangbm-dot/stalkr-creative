// Generate "suspicious behavior" narrative photos per KB (owner secretly on
// their phone at night / hiding the screen) — analogous to KB1's
// ryan-phone.jpg ("screen turned away") and ryan-hide.jpg ("quick to
// hide"). Uses the owner's approved solo avatar as a likeness reference.
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
  // KB2 — Mia
  {
    out: "KB2_behavior_night_change.png",
    ref: "gemini-drafts/KB2_owner_Mia_change.png",
    prompt: "Using the woman in this reference image (keep her face/likeness consistent), create a candid nighttime photo of her lying in bed in the dark, lit only by her phone screen glow, texting with a secretive, guarded expression. Realistic phone-camera style, moody low light. Portrait orientation. No text or watermark.",
  },
  {
    out: "KB2_behavior_hide_change.png",
    ref: "gemini-drafts/KB2_owner_Mia_change.png",
    prompt: "Using the woman in this reference image (keep her face/likeness consistent), create a candid photo of her quickly turning her phone face-down on a table, glancing up with a startled, caught-off-guard expression as if someone just walked in. Realistic phone-camera style, indoor lighting. Portrait orientation. No text or watermark.",
  },
  // KB3 — Alex
  {
    out: "KB3_behavior_night_change.png",
    ref: "gemini-drafts/KB3_owner_Alex_change.png",
    prompt: "Using the man in this reference image (keep his face/likeness consistent), create a candid nighttime photo of him sitting up in bed, back partly turned away, phone screen glow lighting his face, texting secretively. Realistic phone-camera style, moody low light. Portrait orientation. No text or watermark.",
  },
  {
    out: "KB3_behavior_hide_change.png",
    ref: "gemini-drafts/KB3_owner_Alex_change.png",
    prompt: "Using the man in this reference image (keep his face/likeness consistent), create a candid photo of him quickly locking and setting his phone face-down on a table, looking up with a tense, guarded expression. Realistic phone-camera style, indoor lighting. Portrait orientation. No text or watermark.",
  },
  // KB4 — Daniel
  {
    out: "KB4_behavior_smile_change.png",
    ref: "gemini-drafts/KB4_owner_Daniel_change.png",
    prompt: "Using the man in this reference image (keep his face/likeness consistent), create a candid photo of him sitting on a couch at home, smiling secretively at his phone screen (screen not visible to camera), a little too pleased with whatever he's reading. Realistic phone-camera style, warm indoor lighting. Portrait orientation. No text or watermark.",
  },
  {
    out: "KB4_behavior_hide_change.png",
    ref: "gemini-drafts/KB4_owner_Daniel_change.png",
    prompt: "Using the man in this reference image (keep his face/likeness consistent), create a candid photo of him quickly flipping his phone face-down on the couch armrest, glancing toward the camera with a slightly caught-off-guard look. Realistic phone-camera style, warm indoor lighting. Portrait orientation. No text or watermark.",
  },
];

async function main() {
  const apiKey = readApiKey();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const job of JOBS) {
    try {
      const refBytes = fs.readFileSync(job.ref);
      const buf = await callGemini(apiKey, job.prompt, [{ mime: "image/png", data: refBytes }]);
      fs.writeFileSync(path.join(OUT_DIR, job.out), buf);
      console.log("wrote", job.out);
    } catch (e) {
      console.error("FAILED", job.out, "-", e.message);
    }
  }
}

main();
