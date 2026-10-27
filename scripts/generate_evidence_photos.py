"""
One-off content-generation script (NOT part of the build/runtime) for case
05_daniel_scam: generates 1 composite "evidence photo" per victim showing
Daniel personally handing her the gift he bought with Chloe's money, using
the EXISTING character photos as reference images (image-to-image) so faces
stay consistent with the rest of the case's assets.

Usage:
    python scripts/generate_evidence_photos.py sophie     # test 1 victim first
    python scripts/generate_evidence_photos.py all        # generate all 5

Reads the API key from gemini_api_key.txt at the repo root (one level above
the worktree root) - never hardcode the key in this file.
"""
import base64
import io
import json
import sys
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "src" / "cases" / "05_daniel_scam" / "img"
KEY_FILE = Path(r"D:\Quang\Works\Tool\stalkr-creative\gemini_api_key.txt")
MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

VICTIMS = {
    "sophie": {"item_img": "item_giftcards.webp", "item_text": "a set of gift cards", "setting": "a hospital staff break room, her in nurse scrubs"},
    "jenny": {"item_img": "item_flowers.webp", "item_text": "a gift box and a bouquet of roses", "setting": "the doorstep of her apartment building"},
    "anna": {"item_img": "item_handbag.webp", "item_text": "a designer handbag", "setting": "an airport terminal, departures area"},
    "rachel": {"item_img": "item_ring.webp", "item_text": "a diamond ring in an open box", "setting": "a quiet cafe table"},
    "elena": {"item_img": None, "item_text": "two airline flight tickets", "setting": "in front of an art gallery entrance"},
}


def read_api_key() -> str:
    for line in KEY_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line
    raise SystemExit(f"No API key found in {KEY_FILE}")


def to_inline_part(path: Path) -> dict:
    data = path.read_bytes()
    return {"inline_data": {"mime_type": "image/webp", "data": base64.b64encode(data).decode("ascii")}}


def generate_one(name: str, api_key: str) -> None:
    cfg = VICTIMS[name]
    parts = [
        to_inline_part(IMG_DIR / "daniel.webp"),
        to_inline_part(IMG_DIR / f"{name}.webp"),
    ]
    if cfg["item_img"]:
        parts.append(to_inline_part(IMG_DIR / cfg["item_img"]))

    prompt = (
        "Reference photo 1 is a MAN. Reference photo 2 is a WOMAN. "
        "Generate ONE new photo that shows BOTH of them together, standing side by side, "
        "BOTH faces fully visible, matching their appearance in the reference photos. "
        f"The man is personally, physically handing {cfg['item_text']} to the woman with his own "
        f"hands — she is reaching to take it from him. Both of them are smiling at each other. "
        f"Setting: {cfg['setting']}. Wide enough shot to clearly show two separate people, "
        "shoulders to head of both, like a candid photo a third person took on a phone. "
        "Natural lighting, photorealistic, no text or watermark. "
        "The output must contain EXACTLY TWO people total: one man and one woman - never two "
        "women, never a duplicated or cloned person, never the man's face hidden or cropped out."
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
    out_path = IMG_DIR / f"together_{name}.webp"
    img.save(out_path, "WEBP", quality=88)
    print(f"[{name}] saved -> {out_path} ({img.width}x{img.height})")


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    api_key = read_api_key()
    target = sys.argv[1].lower()
    names = list(VICTIMS.keys()) if target == "all" else [target]
    for n in names:
        if n not in VICTIMS:
            print(f"Unknown victim '{n}', skipping")
            continue
        generate_one(n, api_key)


if __name__ == "__main__":
    main()
