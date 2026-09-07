// Split each KB's couple reference photo into 2 solo character portraits via
// Gemini image editing. Reads gemini_api_key.txt (gitignored). Never touches
// the original character-refs/{KB}/{KB}.jpg — writes new files elsewhere.
import fs from "node:fs";
import path from "node:path";

const KEY_FILE = "gemini_api_key.txt";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
const OUT_DIR = "gemini-drafts";

function readApiKey() {
  const raw = fs.readFileSync(KEY_FILE, "utf8");
  const line = raw
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#"));
  if (!line) throw new Error("No API key line found in " + KEY_FILE);
  return line;
}

const JOBS = [
  {
    kb: "KB2",
    ref: "character-refs/KB2/KB2.jpg",
    people: [
      { role: "client", name: "Kevin", desc: "the man (curly hair)" },
      { role: "owner", name: "Mia", desc: "the woman (braided hair)" },
    ],
  },
  {
    kb: "KB3",
    ref: "character-refs/KB3/KB3.jpg",
    people: [
      { role: "owner", name: "Alex", desc: "the man (sunglasses)" },
      { role: "client", name: "Sophia", desc: "the woman (holding a drink, showing a ring)" },
    ],
  },
  {
    kb: "KB4",
    ref: "character-refs/KB4/KB4.jpg",
    people: [
      { role: "owner", name: "Daniel", desc: "the man (white shirt)" },
      { role: "client", name: "Sarah", desc: "the woman (brunette, necklaces)" },
    ],
  },
];

async function generateOne(apiKey, refBytes, mimeType, person, kb) {
  const prompt = `This photo shows a couple together. Generate a clean solo portrait of ONLY ${person.desc} from this photo — same face, hairstyle, and likeness, cropped to shoulders-up, natural lighting, neutral soft background, no other person in frame, no text or watermark. This will be used as a character avatar in a mobile mystery game.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: refBytes.toString("base64") } },
        ],
      },
    ],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gemini API ${res.status} for ${kb}/${person.role}: ${text.slice(0, 500)}`);
  const json = JSON.parse(text);
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) throw new Error(`No image returned for ${kb}/${person.role}: ${JSON.stringify(json).slice(0, 500)}`);
  const data = (imgPart.inlineData || imgPart.inline_data).data;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${kb}_${person.role}_${person.name}_change.png`);
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log("wrote", outPath);
}

async function main() {
  const apiKey = readApiKey();
  const only = process.argv[2]; // optional: "KB2" to run just one
  for (const job of JOBS) {
    if (only && job.kb !== only) continue;
    const refBytes = fs.readFileSync(job.ref);
    const mimeType = job.ref.endsWith(".png") ? "image/png" : "image/jpeg";
    for (const person of job.people) {
      try {
        await generateOne(apiKey, refBytes, mimeType, person, job.kb);
      } catch (e) {
        console.error("FAILED:", job.kb, person.role, "-", e.message);
      }
    }
  }
}

main();
