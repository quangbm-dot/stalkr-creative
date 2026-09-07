// Generate the "third character" solo avatars (no reference photo) and the
// "together" evidence photos (composited from 2 already-generated avatars)
// needed to finish KB2/KB3/KB4. Reads gemini_api_key.txt (gitignored).
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
  for (const img of images) {
    parts.push({ inline_data: { mime_type: img.mime, data: img.data.toString("base64") } });
  }
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

const SOLO_JOBS = [
  {
    out: "KB2_third_Nam_change.png",
    prompt: "A clean solo portrait photo of a young Vietnamese man in his late 20s, casual style, short black hair, friendly slight smile, shoulders-up framing, natural lighting, neutral soft background, no text or watermark. For use as a character avatar in a mobile mystery game.",
  },
  {
    out: "KB3_third_Ngan_change.png",
    prompt: "A clean solo portrait photo of a young Vietnamese woman in her late 20s, casual elegant style, long dark hair, warm smile, shoulders-up framing, natural lighting, neutral soft background, no text or watermark. For use as a character avatar in a mobile mystery game.",
  },
  {
    out: "KB4_third_Ivy_change.png",
    prompt: "A clean solo portrait photo of a woman in her early 30s, stylish, shoulder-length brown hair, confident smile, shoulders-up framing, natural lighting, neutral soft background, no text or watermark. For use as a character avatar in a mobile mystery game.",
  },
];

const TOGETHER_JOBS = [
  {
    out: "KB2_evidence_MiaNam_change.png",
    imgs: ["gemini-drafts/KB2_owner_Mia_change.png", "gemini-drafts/KB2_third_Nam_change.png"],
    prompt: "Using the two people shown in these reference images (keep both faces/likeness consistent), create ONE new candid casual photo of them together at a cozy coffee shop, sitting close, natural phone-selfie style lighting, looking happy together. Portrait orientation. No text or watermark.",
  },
  {
    out: "KB4_evidence_DanielIvy_change.png",
    imgs: ["gemini-drafts/KB4_owner_Daniel_change.png", "gemini-drafts/KB4_third_Ivy_change.png"],
    prompt: "Using the two people shown in these reference images (keep both faces/likeness consistent), create ONE new candid casual photo of them together at an outdoor cafe table, smiling, natural phone-selfie style lighting. Portrait orientation. No text or watermark.",
  },
];

async function main() {
  const apiKey = readApiKey();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const job of SOLO_JOBS) {
    try {
      const buf = await callGemini(apiKey, job.prompt, []);
      fs.writeFileSync(path.join(OUT_DIR, job.out), buf);
      console.log("wrote", job.out);
    } catch (e) {
      console.error("FAILED solo", job.out, "-", e.message);
    }
  }

  for (const job of TOGETHER_JOBS) {
    try {
      const images = job.imgs.map((p) => ({ mime: "image/png", data: fs.readFileSync(p) }));
      const buf = await callGemini(apiKey, job.prompt, images);
      fs.writeFileSync(path.join(OUT_DIR, job.out), buf);
      console.log("wrote", job.out);
    } catch (e) {
      console.error("FAILED together", job.out, "-", e.message);
    }
  }
}

main();
