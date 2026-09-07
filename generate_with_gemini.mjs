// One-off tool: ask Gemini to redesign a reference app icon into an original,
// non-infringing icon that keeps a similar color mood / polish. Reads the API
// key from gemini_api_key.txt (gitignored, never printed).
import fs from "node:fs";
import path from "node:path";

const KEY_FILE = "gemini_api_key.txt";
const OUT_DIR = process.argv[2] || "gemini-drafts";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

function readApiKey() {
  const raw = fs.readFileSync(KEY_FILE, "utf8");
  const line = raw
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#"));
  if (!line) throw new Error("No API key line found in " + KEY_FILE);
  return line;
}

const TASKS = [
  {
    out: "flurt-from-tinder.png",
    ref: "tinder.webp",
    prompt:
      "This image is a placeholder dating-app icon (a stylized flame mark) used in a mobile game mockup, in the style of a well-known real dating app's logo. Redesign it into a completely original, fictional app icon for a detective/mystery game's in-game dating app called 'Flurt' — keep the same rounded-square icon shape, similar warm pink-to-red gradient mood and the same level of flat, polished, minimal style, but change the core symbol to something clearly different from a flame (for example a stylized heart, spark, or abstract mark) so it does not resemble any real company's trademarked logo. Plain icon only, centered, no text, no watermark, no background scene — just the app icon itself on a transparent or solid background.",
  },
  {
    out: "glimpse-from-instagram.png",
    ref: "instagram.webp",
    prompt:
      "This image is a placeholder social/photo-sharing app icon (a stylized camera ring mark) used in a mobile game mockup, in the style of a well-known real social app's logo. Redesign it into a completely original, fictional app icon for a detective/mystery game's in-game photo app called 'Glimpse' — keep the same rounded-square icon shape, similar warm gradient mood and the same flat, polished, minimal style, but change the core symbol to something clearly different from a camera/ring (for example a picture frame, sparkle, or abstract photo motif) so it does not resemble any real company's trademarked logo. Plain icon only, centered, no text, no watermark, no background scene.",
  },
  {
    out: "mailly-from-gmail.png",
    ref: "gmail.webp",
    prompt:
      "This image is a placeholder email app icon (a stylized colorful folded-envelope mark) used in a mobile game mockup, in the style of a well-known real email app's logo. Redesign it into a completely original, fictional app icon for a detective/mystery game's in-game email app called 'Mailly' — keep the same rounded-square icon shape, a similar bright multi-color mood and the same flat, polished, minimal style, but change the core symbol to something clearly different from that specific folded-envelope mark (for example a plain envelope, paper airplane, or abstract mail motif) so it does not resemble any real company's trademarked logo. Plain icon only, centered, no text, no watermark, no background scene.",
  },
];

async function generateOne(apiKey, task, refDir) {
  const refPath = path.join(refDir, task.ref);
  const refBytes = fs.readFileSync(refPath);
  const mimeType = task.ref.endsWith(".webp") ? "image/webp" : "image/png";

  const body = {
    contents: [
      {
        parts: [
          { text: task.prompt },
          { inline_data: { mime_type: mimeType, data: refBytes.toString("base64") } },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini API ${res.status} for ${task.out}: ${text.slice(0, 500)}`);
  }
  const json = JSON.parse(text);
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    throw new Error(`No image returned for ${task.out}. Response: ${JSON.stringify(json).slice(0, 800)}`);
  }
  const data = (imgPart.inlineData || imgPart.inline_data).data;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, task.out);
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log("wrote", outPath);
}

async function main() {
  const apiKey = readApiKey();
  const refDir = process.argv[3];
  if (!refDir) throw new Error("usage: node generate_with_gemini.mjs <outDir> <refDir>");
  for (const task of TASKS) {
    try {
      await generateOne(apiKey, task, refDir);
    } catch (e) {
      console.error("FAILED:", task.out, "-", e.message);
    }
  }
}

main();
