"""
One-off content-generation script (NOT part of build/runtime) for the v17
spike case 11_abby_ryan_v17: generates 3 new photos for the opening/letters
"film reel" so each frame has its own real-looking image instead of reusing
mismatched stock photos. Uses Abby/Ryan's existing reference photos (from
case 07_abby_ryan_full) so faces stay consistent with the rest of the case.

Usage:
    python scripts/generate_v17_filmreel_photos.py

Reads the API key from gemini_api_key.txt at the repo root — never
hardcode the key in this file.
"""
import base64
import io
import json
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REF_DIR = ROOT / "src" / "cases" / "07_abby_ryan_full" / "img"
OUT_DIR = REF_DIR  # case11 reuses case07's img/ folder via a relative glob
KEY_FILE = Path(r"D:\Quang\Works\Tool\stalkr-creative\gemini_api_key.txt")
MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


def read_api_key() -> str:
    for line in KEY_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line
    raise SystemExit(f"No API key found in {KEY_FILE}")


def to_inline_part(path: Path) -> dict:
    data = path.read_bytes()
    return {"inline_data": {"mime_type": "image/webp", "data": base64.b64encode(data).decode("ascii")}}


def generate(name: str, parts: list, api_key: str) -> None:
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"]}}
    resp = requests.post(
        ENDPOINT,
        headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
        data=json.dumps(body),
        timeout=120,
    )
    if resp.status_code != 200:
        print(f"[{name}] HTTP {resp.status_code}: {resp.text[:800]}")
        return

    data = resp.json()
    out_parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    img_b64 = None
    for p in out_parts:
        inline = p.get("inlineData") or p.get("inline_data")
        if inline and inline.get("data"):
            img_b64 = inline["data"]
            break
    if not img_b64:
        print(f"[{name}] No image in response: {json.dumps(data)[:800]}")
        return

    img_bytes = base64.b64decode(img_b64)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    out_path = OUT_DIR / f"{name}.webp"
    img.save(out_path, "WEBP", quality=88)
    print(f"[{name}] saved -> {out_path} ({img.width}x{img.height})")


def main():
    api_key = read_api_key()
    abby = to_inline_part(REF_DIR / "abby.webp")
    ryan = to_inline_part(REF_DIR / "ryan.webp")

    generate(
        "midfight_kitchen",
        [
            abby,
            ryan,
            {
                "text": (
                    "Reference photo 1 is a WOMAN. Reference photo 2 is a MAN. "
                    "Generate ONE new photorealistic photo of them mid-argument in a home kitchen "
                    "at night, matching their appearance in the reference photos. The woman is "
                    "reaching for a phone on the counter, tense and upset; the man is half-turning "
                    "away, one hand near the phone like he just noticed her reaching for it, "
                    "caught off guard. Dim warm kitchen lighting, candid phone-photo framing, both "
                    "faces visible. No text, no watermark. Exactly two people: one woman, one man."
                )
            },
        ],
        api_key,
    )

    generate(
        "ryan_notepad",
        [
            ryan,
            {
                "text": (
                    "Reference photo is a MAN. Generate ONE new photorealistic photo of him alone, "
                    "sitting at a kitchen table at night, matching his appearance in the reference "
                    "photo. He is hunched over a small paper notepad, pen in hand, mid-writing, "
                    "guilty and anxious expression, not looking at camera. Warm single lamp "
                    "lighting, candid phone-photo framing. No text, no watermark. Exactly one "
                    "person in frame."
                )
            },
        ],
        api_key,
    )

    generate(
        "letter_closeup",
        [
            ryan,
            {
                "text": (
                    "Reference photo is a MAN's hand/style for consistency only. Generate ONE new "
                    "photorealistic CLOSE-UP photo of a man's hand writing on a small paper notepad "
                    "with a pen, at night, on a wooden kitchen table, lit by a single warm lamp. "
                    "Only the hand, pen, and notepad are in focus; no face in frame. The paper has "
                    "a few short handwritten lines but they should be illegibly blurred/out of "
                    "focus, not readable text. No watermark, no logos."
                )
            },
        ],
        api_key,
    )


if __name__ == "__main__":
    main()
