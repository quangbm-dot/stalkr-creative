// One-off: generate the "mystery woman" (unidentified character, face hidden,
// dark/noir tone) image for the v11 cinematic intro via Gemini image gen.
import fs from "node:fs";

const KEY_FILE = "../../gemini_api_key.txt";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
const OUT_DIR = "src/Components/IntroCinematic/img";

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
    "Close-up selfie-style portrait photo of a young woman with long hair, outdoors on a city street, head and shoulders filling the frame exactly like a casual phone selfie, wearing all black clothing, but her face completely obscured in deep shadow / silhouette so no facial features are visible at all, moody cinematic lighting, photorealistic, portrait orientation, no text, no logo.",
    "mysteryWoman.jpg",
  );
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
