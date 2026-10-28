"""
One-off content-generation script (NOT part of build/runtime) for case
06_abby_ryan: regenerates the "Hidden" vault photo (cake_reveal.webp) so the
icing on the cake reads "Lauren & Ryan" instead of "Happy 6 months" — keeps
the same couple/composition by using the current photo + their face refs.

Usage:
    python scripts/generate_cake_photo.py

Reads the API key from gemini_api_key.txt at the repo root.
"""
import base64
import io
import json
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "src" / "cases" / "06_abby_ryan" / "img"
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


def main():
    api_key = read_api_key()
    parts = [
        to_inline_part(IMG_DIR / "cake_reveal.webp"),
        to_inline_part(IMG_DIR / "ryan.webp"),
        to_inline_part(IMG_DIR / "lauren.webp"),
    ]
    prompt = (
        "Reference photo 1 is the SOURCE photo: a man and a woman posing cheek to cheek behind a "
        "round birthday cake with lit candles, his arm around her. Reference photo 2 is the MAN's "
        "face, reference photo 3 is the WOMAN's face — match both faces exactly to these references. "
        "Regenerate the SOURCE photo almost unchanged (same two people, same poses, same cheek-to-"
        "cheek closeness, same candles, same warm indoor lighting), with ONE change: replace the red "
        "cursive icing text on the cake. The source cake currently reads 'Happy 6 months'. In the new "
        "image the icing must instead read exactly 'Lauren & Ryan' in the same red cursive "
        "handwriting style, written on ONE line if it fits, or two short balanced lines — but the "
        "ENTIRE text plus the small red heart must be fully visible with clear margin above, below "
        "and to both sides, never cut off or cropped by the frame edge. Output a tall PORTRAIT photo "
        "(aspect ratio about 3:4, taller than it is wide), fully filled edge-to-edge with the photo "
        "content — no blank, grey, or padded borders anywhere in the image. No other text or "
        "watermark. Keep it photorealistic."
    )
    parts.append({"text": prompt})

    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"]}}
    resp = requests.post(
        ENDPOINT,
        headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
        data=json.dumps(body),
        timeout=120,
    )
    if resp.status_code != 200:
        print(f"HTTP {resp.status_code}: {resp.text[:800]}")
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
        print(f"No image in response: {json.dumps(data)[:800]}")
        return

    img_bytes = base64.b64decode(img_b64)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    out_path = IMG_DIR / "cake_reveal_v2.webp"
    img.save(out_path, "WEBP", quality=88)
    print(f"saved -> {out_path} ({img.width}x{img.height})")


if __name__ == "__main__":
    main()
