"""
One-off content-generation script (NOT part of build/runtime) for the new
v18 case 12_ruby_marco_v18 ("Ruby & Marco"): generates every character
portrait + evidence photo this brand-new case needs, since (unlike v17's
spike) it does not reuse an existing case's images.

Usage:
    python -I scripts/generate_v18_case_photos.py            # all images
    python -I scripts/generate_v18_case_photos.py ruby marco # only these

Reads the API key from gemini_api_key.txt at the repo root (one level
above the worktree root) - never hardcode the key in this file.
"""
import base64
import io
import json
import sys
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "cases" / "12_ruby_marco_v18" / "img"
OUT_DIR.mkdir(parents=True, exist_ok=True)
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
    out_path = OUT_DIR / f"{name}.webp"
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
    img.save(out_path, "WEBP", quality=88)
    print(f"[{name}] saved -> {out_path} ({img.width}x{img.height})")


def build_jobs(api_key: str) -> dict:
    jobs = {}

    jobs["ruby"] = lambda: generate(
        "ruby",
        [{
            "text": (
                "Generate ONE photorealistic portrait photo of a woman, 29 years old, "
                "warm brown eyes, shoulder-length dark wavy hair, light olive skin, wearing a "
                "cozy cream sweater, soft natural window light, candid phone-selfie style, "
                "slightly worried/thoughtful expression, plain home background. No text, no "
                "watermark. Exactly one person in frame."
            )
        }],
        api_key,
    )

    jobs["marco"] = lambda: generate(
        "marco",
        [{
            "text": (
                "Generate ONE photorealistic portrait photo of a man, 32 years old, short dark "
                "hair, light stubble, tan skin, wearing a plain grey t-shirt, soft natural "
                "light, candid phone-photo style, relaxed neutral expression, plain home "
                "background. No text, no watermark. Exactly one person in frame."
            )
        }],
        api_key,
    )

    jobs["nora"] = lambda: generate(
        "nora",
        [{
            "text": (
                "Generate ONE photorealistic portrait photo of a woman, 30 years old, long "
                "auburn hair tied back, freckled fair skin, wearing a clay-stained canvas "
                "apron over a plain top, standing in a pottery studio with wheels and shelves "
                "of ceramics blurred behind her, warm studio light, candid photo style, "
                "genuine smile. No text, no watermark. Exactly one person in frame."
            )
        }],
        api_key,
    )

    def marco_checkin():
        marco = to_inline_part(OUT_DIR / "marco.webp")
        generate(
            "marco_checkin",
            [
                marco,
                {"text": (
                    "Reference photo is a MAN. Generate ONE new photorealistic candid photo of "
                    "him, matching his appearance in the reference photo, sitting on a couch at "
                    "home holding a coffee mug, looking slightly away from camera as if someone "
                    "just took the photo of him unexpectedly, warm evening lamp light. No text, "
                    "no watermark. Exactly one person in frame."
                )},
            ],
            api_key,
        )
    jobs["marco_checkin"] = marco_checkin

    def ruby_marco_duo():
        ruby = to_inline_part(OUT_DIR / "ruby.webp")
        marco = to_inline_part(OUT_DIR / "marco.webp")
        generate(
            "ruby_marco_duo",
            [
                ruby,
                marco,
                {"text": (
                    "Reference photo 1 is a WOMAN. Reference photo 2 is a MAN. Generate ONE new "
                    "photorealistic candid selfie-style photo of them together as a couple, "
                    "cheeks close, both smiling at the camera, matching their appearance in the "
                    "reference photos, casual outdoor setting, natural daylight, phone-selfie "
                    "framing. No text, no watermark. Exactly two people: one woman, one man."
                )},
            ],
            api_key,
        )
    jobs["ruby_marco_duo"] = ruby_marco_duo

    jobs["card_receipt"] = lambda: generate(
        "card_receipt",
        [{
            "text": (
                "Generate ONE photorealistic close-up photo of a paper store receipt lying on a "
                "wooden table, photographed at a slight angle like a quick phone snapshot. The "
                "receipt shows a jewelry store header and an itemized line for a bracelet with a "
                "price, but render the exact text SLIGHTLY blurred/out of focus so it reads as a "
                "receipt without being fully legible. Soft indoor lighting. No watermark."
            )
        }],
        api_key,
    )

    jobs["card_gift"] = lambda: generate(
        "card_gift",
        [{
            "text": (
                "Generate ONE photorealistic photo of a small open gift box on a table, "
                "revealing a delicate gold bracelet nestled in tissue paper inside, soft warm "
                "lighting, shallow depth of field, candid phone-photo style, no people in "
                "frame. No text, no watermark."
            )
        }],
        api_key,
    )

    jobs["card_lovenote"] = lambda: generate(
        "card_lovenote",
        [{
            "text": (
                "Generate ONE photorealistic extreme close-up photo of a small handwritten note "
                "card on a wooden table, soft warm lamp lighting, shallow depth of field. The "
                "handwriting is visible but render it SLIGHTLY blurred/out of focus so it is not "
                "fully legible, just a cozy handwritten note aesthetic. No people, no watermark."
            )
        }],
        api_key,
    )

    jobs["card_giftwrap"] = lambda: generate(
        "card_giftwrap",
        [{
            "text": (
                "Generate ONE photorealistic photo of a small wrapped gift box with a ribbon "
                "bow, unopened, sitting on a kitchen counter, soft warm lighting, candid "
                "phone-photo style, no people in frame. No text, no watermark."
            )
        }],
        api_key,
    )

    jobs["card_flowers"] = lambda: generate(
        "card_flowers",
        [{
            "text": (
                "Generate ONE photorealistic photo of a small bouquet of flowers wrapped in "
                "brown kraft paper, lying on a car passenger seat, soft daylight, candid "
                "phone-photo style, no people in frame. No text, no watermark."
            )
        }],
        api_key,
    )

    jobs["card_tag"] = lambda: generate(
        "card_tag",
        [{
            "text": (
                "Generate ONE photorealistic extreme close-up photo of a small gift tag tied "
                "with string to a ribbon, soft warm lighting, shallow depth of field. The tag "
                "has a short handwritten word on it, but render it SLIGHTLY blurred/out of "
                "focus so it is not fully legible. No people, no watermark."
            )
        }],
        api_key,
    )

    def pottery_reveal():
        marco = to_inline_part(OUT_DIR / "marco.webp")
        nora = to_inline_part(OUT_DIR / "nora.webp")
        generate(
            "pottery_reveal",
            [
                marco,
                nora,
                {"text": (
                    "Reference photo 1 is a MAN. Reference photo 2 is a WOMAN. Generate ONE new "
                    "photorealistic candid photo of them together at a pottery studio, matching "
                    "their appearance in the reference photos, both laughing while his hands are "
                    "over hers on a pottery wheel, clay-stained aprons, warm studio light, "
                    "phone-photo framing, both faces clearly visible. No text, no watermark. "
                    "Exactly two people: one man, one woman."
                )},
            ],
            api_key,
        )
    jobs["pottery_reveal"] = pottery_reveal

    return jobs


def main():
    api_key = read_api_key()
    jobs = build_jobs(api_key)
    order = [
        "ruby", "marco", "nora", "marco_checkin", "ruby_marco_duo",
        "card_receipt", "card_gift", "card_lovenote", "card_giftwrap", "card_flowers", "card_tag",
        "pottery_reveal",
    ]
    targets = sys.argv[1:] or order
    for name in order:
        if name not in targets:
            continue
        jobs[name]()


if __name__ == "__main__":
    main()
