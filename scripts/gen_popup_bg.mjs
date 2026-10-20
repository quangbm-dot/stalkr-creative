// One-off: regenerate src/Assets/UI/popup.jpg (question-popup sky background)
// via Gemini image gen, using the current image as a style reference.
import fs from "node:fs";

const KEY_FILE = "../../gemini_api_key.txt";
const REF = "src/Assets/UI/popup.jpg";
const OUT = "gemini-drafts/popup-bg-new.png";
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

const PROMPT =
  "This image is a soft pastel illustrated sky background (blue gradient, fluffy white clouds, tiny sparkles, a shooting star) used as the background of a mobile detective-story chat popup. Generate a fresh variation of this same illustrated sky — same cute, flat, dreamy pastel-blue-to-cream gradient style, same simple rounded fluffy clouds and sparkle/star accents scattered around, same vertical mobile aspect ratio — but with a slightly different cloud arrangement so it doesn't look identical to the reference. Keep it a plain atmospheric sky background only: no text, no characters, no UI elements, no watermark.";

async function main() {
  const apiKey = readApiKey();
  const refBytes = fs.readFileSync(REF);
  const body = {
    contents: [
      {
        parts: [{ text: PROMPT }, { inline_data: { mime_type: "image/jpeg", data: refBytes.toString("base64") } }],
      },
    ],
    generationConfig: { responseModalities: ["IMAGE"] },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${text.slice(0, 500)}`);
  const json = JSON.parse(text);
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) throw new Error(`No image returned. Response: ${JSON.stringify(json).slice(0, 800)}`);
  const data = (imgPart.inlineData || imgPart.inline_data).data;
  fs.mkdirSync("gemini-drafts", { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(data, "base64"));
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
