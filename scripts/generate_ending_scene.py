"""
One-off content-generation script (NOT part of build/runtime) for case
06_abby_ryan: generates the EndCard teaser image — Abby confronting Ryan
with Lauren present, a tense 3-person scene — using the case's existing
character photos as reference images so faces stay consistent.

Usage:
    python scripts/generate_ending_scene.py

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
        to_inline_part(IMG_DIR / "abby.webp"),
        to_inline_part(IMG_DIR / "ryan.webp"),
        to_inline_part(IMG_DIR / "lauren.webp"),
    ]
    prompt = (
        "Reference photo 1 is WOMAN A. Reference photo 2 is a MAN. Reference photo 3 is WOMAN B. "
        "Generate ONE new photorealistic photo showing all THREE of them together in the same room, "
        "matching their appearance in the reference photos. It is a tense confrontation: WOMAN A "
        "(arms crossed, furious, confronting) stands facing the MAN, who looks caught off guard / "
        "guilty, one hand raised like he's trying to explain; WOMAN B stands a few steps behind him, "
        "visibly uncomfortable and looking away. Living room setting, evening, dramatic natural "
        "lighting. Wide enough shot to clearly show all three separate people, head and shoulders "
        "of all three, like a candid photo a fourth person took on a phone. No text, no watermark. "
        "The output must contain EXACTLY THREE people total: two women and one man — never fewer, "
        "never duplicated or cloned people, never any of the three faces hidden or cropped out."
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
    out_path = IMG_DIR / "ending_argue.webp"
    img.save(out_path, "WEBP", quality=88)
    print(f"saved -> {out_path} ({img.width}x{img.height})")


if __name__ == "__main__":
    main()
